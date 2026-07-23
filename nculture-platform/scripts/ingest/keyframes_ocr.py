#!/usr/bin/env python
"""강의 영상 -> 씬체인지 키프레임 -> 한국어 OCR PoC

목적: 강사가 '화면에만' 띄우는 프롬프트/슬라이드 텍스트를 회수한다.
      (음성에 안 남는 가장 값진 콘텐츠 — SRT 전사만으로는 놓치는 부분)

사용법: python keyframes_ocr.py <video.mp4> [scene_threshold]
  scene_threshold: 프레임 평균차 임계값 (기본 8.0, 낮을수록 민감)
출력: frames/ 에 키프레임 jpg, <video>.ocr.txt 에 타임스탬프+텍스트
단계: opencv 로 1fps 샘플링 -> 이전 키프레임 대비 차이 큰 프레임만 채택 -> easyocr(ko+en)
"""
import sys, os, time
import cv2
import numpy as np


def fmt_ts(seconds: float) -> str:
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def extract_keyframes(video, out_dir, threshold=8.0, sample_fps=1.0, max_frames=120):
    cap = cv2.VideoCapture(video)
    if not cap.isOpened():
        raise RuntimeError(f"영상을 열 수 없음: {video}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total / fps if fps else 0
    step = max(1, int(round(fps / sample_fps)))  # 몇 프레임마다 샘플링
    print(f"  영상: {total:,}프레임 @ {fps:.1f}fps = {fmt_ts(duration)}  (샘플 step={step})")

    keyframes = []          # (timestamp, filepath)
    prev_small = None
    idx = 0
    while True:
        ok = cap.grab()
        if not ok:
            break
        if idx % step == 0:
            ok, frame = cap.retrieve()
            if not ok:
                break
            ts = idx / fps
            # 64px 그레이스케일로 축소해 평균절대차 비교(슬라이드 전환 검출)
            small = cv2.resize(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), (64, 36))
            take = prev_small is None
            if prev_small is not None:
                diff = float(np.mean(np.abs(small.astype(np.int16) - prev_small.astype(np.int16))))
                take = diff > threshold
            if take:
                prev_small = small
                fp = os.path.join(out_dir, f"kf_{len(keyframes):03d}_{int(ts)}s.jpg")
                cv2.imwrite(fp, frame)
                keyframes.append((ts, fp))
                if len(keyframes) >= max_frames:
                    print(f"  ! max_frames({max_frames}) 도달, 조기 종료")
                    break
        idx += 1
    cap.release()
    return keyframes, duration


def main():
    if len(sys.argv) < 2:
        print("usage: python keyframes_ocr.py <video.mp4> [scene_threshold]")
        sys.exit(1)
    video = sys.argv[1]
    threshold = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
    root = os.path.dirname(os.path.abspath(__file__))
    base = os.path.splitext(os.path.basename(video))[0]
    frames_dir = os.path.join(root, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    ocr_path = os.path.join(root, f"{base}.ocr.txt")

    print("[1/3] 키프레임 추출 (opencv 씬체인지)")
    t0 = time.time()
    keyframes, duration = extract_keyframes(video, frames_dir, threshold)
    print(f"      키프레임 {len(keyframes)}장, {time.time()-t0:.1f}s")

    print("[2/3] OCR 엔진 로드 (easyocr ko+en, 최초 실행 시 모델 다운로드)")
    import easyocr
    reader = easyocr.Reader(["ko", "en"], gpu=False)

    print("[3/3] 키프레임 OCR")
    t1 = time.time()
    lines, total_chars = [], 0
    for i, (ts, fp) in enumerate(keyframes):
        results = reader.readtext(fp, detail=0, paragraph=True)
        text = " ".join(r.strip() for r in results if r.strip())
        total_chars += len(text)
        lines.append(f"[{fmt_ts(ts)}] {text}")
        if text:
            print(f"  [{fmt_ts(ts)}] {text[:70]}")
    with open(ocr_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    est_tokens = int(total_chars * 1.2)
    print(f"\n완료")
    print(f"  키프레임     : {len(keyframes)}장")
    print(f"  OCR 소요     : {time.time()-t1:.1f}s")
    print(f"  추출 글자수  : {total_chars:,}")
    print(f"  토큰 추정    : {est_tokens:,}")
    print(f"  프레임 이미지: {frames_dir}/")
    print(f"  OCR 텍스트   : {ocr_path}")


if __name__ == "__main__":
    main()
