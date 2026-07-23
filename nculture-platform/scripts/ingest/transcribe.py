#!/usr/bin/env python
"""강의 영상 -> SRT 전사 PoC (faster-whisper, 로컬 CPU, ffmpeg 불필요)

사용법: python transcribe.py <video.mp4> [model]
  model: tiny|base|small|medium|large-v3  (기본 small)
출력: <video>.srt, <video>.txt, 콘솔에 요약(길이/글자수/토큰추정/소요시간)
"""
import sys, time, os
from faster_whisper import WhisperModel


def fmt_ts(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    if len(sys.argv) < 2:
        print("usage: python transcribe.py <video.mp4> [model]")
        sys.exit(1)
    video = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else "small"
    base = os.path.splitext(os.path.basename(video))[0]
    out_dir = os.path.dirname(os.path.abspath(__file__))
    srt_path = os.path.join(out_dir, f"{base}.srt")
    txt_path = os.path.join(out_dir, f"{base}.txt")

    print(f"[1/3] 모델 로드: {model_size} (int8, CPU)")
    t0 = time.time()
    # CPU + int8: Apple Silicon에서 별도 GPU 설정 없이 동작
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    print(f"      로드 완료 {time.time()-t0:.1f}s")

    print(f"[2/3] 전사 시작: {video}")
    t1 = time.time()
    segments, info = model.transcribe(
        video,
        language="ko",
        vad_filter=True,               # 무음 구간 제거 -> 속도/정확도 개선
        vad_parameters=dict(min_silence_duration_ms=500),
        beam_size=5,
    )
    print(f"      감지 언어={info.language} (p={info.language_probability:.2f}), "
          f"오디오 길이={info.duration:.1f}s")

    srt_lines, full_text = [], []
    n = 0
    for seg in segments:
        n += 1
        text = seg.text.strip()
        srt_lines.append(f"{n}\n{fmt_ts(seg.start)} --> {fmt_ts(seg.end)}\n{text}\n")
        full_text.append(text)
        if n <= 5 or n % 25 == 0:
            print(f"      [{fmt_ts(seg.start)}] {text[:60]}")
    elapsed = time.time() - t1

    joined = "\n".join(full_text)
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_lines))
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(joined)

    chars = len(joined)
    est_tokens = int(chars * 1.2)  # 대화에서 쓴 한국어 토큰 추정치
    rt = info.duration / elapsed if elapsed else 0
    print(f"\n[3/3] 완료")
    print(f"  세그먼트     : {n}개")
    print(f"  글자수       : {chars:,}")
    print(f"  토큰 추정    : {est_tokens:,}  (x1.2 heuristic)")
    print(f"  전사 소요    : {elapsed:.1f}s  ({rt:.1f}x 실시간)")
    print(f"  SRT          : {srt_path}")
    print(f"  TXT          : {txt_path}")
    # LLM 인제스트 입력 비용 감 (Gemini 2.5 Flash $0.30/1M in)
    print(f"  Gemini 입력비: 약 ${est_tokens/1_000_000*0.30:.4f} (전사분만)")


if __name__ == "__main__":
    main()
