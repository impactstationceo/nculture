#!/usr/bin/env python
"""강의 영상 -> 키프레임 -> 한국어 OCR  (프로덕션 튜닝판 v2)

v1 대비 개선:
  1) 중앙 밴드 크롭: 상단 워터마크 / 하단 자막·웹캠 제거
     -> 매초 바뀌는 번인 자막이 가짜 씬체인지를 유발하던 문제 해결
     -> OCR 대상 축소로 속도 대폭 개선
  2) 씬검출을 '크롭된 콘텐츠 영역'에서만 수행
  3) 응집도 필터: OCR 결과 글자수가 너무 적은 프레임(노이즈/빈 슬라이드) 제거
  4) 연속 중복 제거: 인접 키프레임 OCR이 거의 같으면 하나만 유지
  5) 프레임 하드캡 제거(안전 상한만) -> 강의 전체 커버

사용법: python keyframes_ocr_v2.py <video.mp4> [threshold] [min_chars]
"""
import sys, os, time, difflib
import cv2
import numpy as np

CROP_TOP = 0.10      # 상단 10% 제거(워터마크)
CROP_BOTTOM = 0.28   # 하단 28% 제거(자막+웹캠)


def fmt_ts(s):
    m, s = divmod(int(s), 60); h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def crop_content(frame):
    h = frame.shape[0]
    return frame[int(h * CROP_TOP):int(h * (1 - CROP_BOTTOM)), :]


def extract_keyframes(video, out_dir, threshold, sample_fps=1.0, safety_cap=500):
    cap = cv2.VideoCapture(video)
    if not cap.isOpened():
        raise RuntimeError(f"열 수 없음: {video}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total / fps
    step = max(1, int(round(fps / sample_fps)))
    print(f"  영상 {fmt_ts(duration)} @ {fps:.0f}fps, 샘플 step={step}, "
          f"크롭 [{CROP_TOP:.0%}~{1-CROP_BOTTOM:.0%}]")

    keyframes, prev_small, idx = [], None, 0
    while True:
        if not cap.grab():
            break
        if idx % step == 0:
            ok, frame = cap.retrieve()
            if not ok:
                break
            content = crop_content(frame)
            ts = idx / fps
            small = cv2.resize(cv2.cvtColor(content, cv2.COLOR_BGR2GRAY), (64, 36))
            take = prev_small is None
            if prev_small is not None:
                diff = float(np.mean(np.abs(small.astype(np.int16) - prev_small.astype(np.int16))))
                take = diff > threshold
            if take:
                prev_small = small
                fp = os.path.join(out_dir, f"kf_{len(keyframes):03d}_{int(ts)}s.jpg")
                cv2.imwrite(fp, content)   # 크롭본 저장 -> OCR도 이걸 읽음
                keyframes.append((ts, fp))
                if len(keyframes) >= safety_cap:
                    print(f"  ! safety_cap({safety_cap}) 도달"); break
        idx += 1
    cap.release()
    return keyframes, duration


def main():
    if len(sys.argv) < 2:
        print("usage: python keyframes_ocr_v2.py <video.mp4> [threshold] [min_chars]"); sys.exit(1)
    video = sys.argv[1]
    threshold = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
    min_chars = int(sys.argv[3]) if len(sys.argv) > 3 else 15
    root = os.path.dirname(os.path.abspath(__file__))
    base = os.path.splitext(os.path.basename(video))[0]
    frames_dir = os.path.join(root, "frames_v2")
    os.makedirs(frames_dir, exist_ok=True)
    for f in os.listdir(frames_dir):
        os.remove(os.path.join(frames_dir, f))
    ocr_path = os.path.join(root, f"{base}.ocr_v2.txt")

    print("[1/4] 키프레임 추출 (크롭 + 씬체인지)")
    t0 = time.time()
    keyframes, duration = extract_keyframes(video, frames_dir, threshold)
    cover = keyframes[-1][0] if keyframes else 0
    print(f"      {len(keyframes)}장, {time.time()-t0:.1f}s, 커버 {fmt_ts(cover)}/{fmt_ts(duration)} "
          f"({cover/duration:.0%})")

    print("[2/4] OCR 엔진 로드")
    import easyocr
    reader = easyocr.Reader(["ko", "en"], gpu=False)

    print("[3/4] OCR + 응집도 필터")
    t1 = time.time()
    raw = []
    for ts, fp in keyframes:
        results = reader.readtext(fp, detail=0, paragraph=True)
        text = " ".join(r.strip() for r in results if r.strip())
        if len(text) >= min_chars:          # 빈 슬라이드/짧은 노이즈 제거
            raw.append((ts, text))
    ocr_dt = time.time() - t1

    print("[4/4] 연속 중복 제거")
    deduped, prev = [], ""
    for ts, text in raw:
        if difflib.SequenceMatcher(None, text, prev).ratio() > 0.85:
            continue                          # 직전과 거의 동일 -> 스킵
        deduped.append((ts, text)); prev = text

    lines = [f"[{fmt_ts(ts)}] {t}" for ts, t in deduped]
    with open(ocr_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    total_chars = sum(len(t) for _, t in deduped)

    print(f"\n완료")
    print(f"  키프레임 추출   : {len(keyframes)}장 (v1: 120장, 60%커버)")
    print(f"  응집도 통과     : {len(raw)}장")
    print(f"  중복제거 후     : {len(deduped)}장")
    print(f"  OCR 소요        : {ocr_dt:.1f}s (v1: 1211s)")
    print(f"  최종 글자수     : {total_chars:,} (v1 원본: 38,627)")
    print(f"  토큰 추정       : {int(total_chars*1.2):,}")
    print(f"  OCR 텍스트      : {ocr_path}")
    print("\n=== 최종 OCR (내용 있는 프레임) 앞 25줄 ===")
    for ln in lines[:25]:
        print(" ", ln[:90])


if __name__ == "__main__":
    main()
