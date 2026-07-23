# 강의 인제스트 · 영상 채점 파이프라인 스크립트

강의 오픈 전 오프라인 배치로 실행. 강의 영상에서 학습목표·핵심개념·화면 시연 프롬프트·연습 추천·채점 루브릭을 뽑아 구조화 JSON으로 만든다. (자세한 로직·비용은 `docs/PROGRESS.md`)

## 환경

로컬 도구는 brew 없이 파이썬 휠로만 구성. 시스템 파이썬(3.9)에 venv 권장.

```bash
python3 -m venv .venv
./.venv/bin/pip install faster-whisper opencv-python-headless numpy easyocr imageio-ffmpeg
# ffmpeg 바이너리는 imageio-ffmpeg가 번들 제공 (별도 설치 불필요)
```

Gemini 키는 `frontend/.env` 의 `GEMINI_API_KEY` (신형 `AQ.` 형식)를 읽는다. 모델은 `gemini-3.6-flash` (2.5-flash는 이 계정에서 막힘).

## 실행 — 오케스트레이터 하나로 (권장)

임의 강의 영상 하나를 넣으면 전 파이프라인을 순서대로 돌린다:

```bash
./.venv/bin/python ingest_lecture.py /path/to/lecture.mp4 \
    --copy-to ../../frontend/lib/ingest/lecture.ingest.json
```

전사(Whisper) → 키프레임+OCR → Gemini 구조화 추출 → Gemini 추천 생성 → `<base>.ingest.json`.
무거운 로컬 두 단계(전사·OCR)는 아래 검증된 스크립트를 서브프로세스로 재사용하고
(av/cv2 dylib 충돌 회피), Gemini 두 단계는 인자화해 인라인 처리한다.

주요 옵션: `--whisper small` · `--threshold 10` · `--model gemini-3.6-flash` ·
`--out DIR` · `--copy-to PATH` · `--skip-transcribe` · `--skip-ocr`(재실행 시 재사용).

> 산출 중간파일(`<base>.srt`, `<base>.ocr_v2.txt`, `frames_v2/`)은 이 폴더에 쌓인다 — gitignore 대상.

## 개별 스크립트 (오케스트레이터가 내부적으로 사용)

| 스크립트 | 역할 | 비용 |
|---|---|---|
| `transcribe.py <video> [model]` | faster-whisper 전사 → `.srt`/`.txt` | 로컬 무료 |
| `keyframes_ocr_v2.py <video> [threshold] [min_chars]` | **v2** — 중앙크롭·응집도필터·중복제거, 커버리지 60→98% | 로컬 무료 |
| `keyframes_ocr.py` | v1 (참고용, 미사용) | 로컬 무료 |
| `ingest_test.py` / `enrich_recommendations.py` | Gemini 추출/추천 (PoC 단독본, 경로 하드코딩) | ~$0.095/강의 |
| `grade_video.py` | 생성 영상 Gemini 채점 → `frontend/lib/ingest/sd2.grade.json` | ~$0.011/건 |

`ingest_test.py`·`enrich_recommendations.py`는 `2-3` 경로가 하드코딩된 PoC 단독본이다.
프로덕션은 `ingest_lecture.py`(인자화·통합본)를 쓴다.

## 실측 (강의 1편)

전사 14.7분 + 키프레임 0.6분 + OCR 7.8분 = 로컬 약 23분(무료) · Gemini 2콜 약 $0.095 · 40초.
검증: 시연 프롬프트 10개 회수 + 추천 10/10 병합 + 4축 루브릭 생성.

## 산출물 샘플

실제 강의 `2-3.mp4`(23.9분)로 뽑은 결과가 `docs/samples/`에 있음:
`2-3.srt`(전사) · `2-3.ocr_v2.txt`(OCR) · `2-3.ingest.json`(최종 구조화, 추천 포함).
앱이 실제로 쓰는 것은 `frontend/lib/ingest/2-3.ingest.json`, `sd2.grade.json`.
