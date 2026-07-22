# 자동 배포 (GitHub Actions → Vercel)

`main`에 푸시하면 GitHub Actions가 프론트엔드를 빌드해서 Vercel 프로덕션으로 배포합니다.
PR을 올리면 프리뷰 URL이 생성됩니다.

워크플로 파일: `.github/workflows/deploy.yml`
배포 대상: `nculture-platform/frontend` (Next.js 14)

---

## Vercel 프로젝트 (이미 연결됨)

```
프로젝트명 : nculture_claud
projectId  : prj_KIAoW525l22U59zAgx3eXYHPGOMJ
orgId      : team_xTKmKLZtwWLxepibaMNe7qmJ
Root Dir   : nculture-platform/frontend
```

이 두 ID는 자격증명이 아니라 단순 식별자라서(토큰 없이는 아무것도 못 함)
워크플로에 직접 넣어뒀습니다. 실제 비밀은 `VERCEL_TOKEN` 하나뿐입니다.

> ⚠️ **`vercel` 명령은 반드시 리포 루트에서 실행하세요.**
> Vercel 프로젝트의 Root Directory 설정이 이미 `nculture-platform/frontend` 라서,
> frontend 디렉터리 안에서 `vercel build`를 돌리면 경로가 중복 적용돼 빌드가 깨집니다.
> 워크플로도 리포 루트 기준으로 작성돼 있습니다.

---

## 1회만 하면 되는 설정 (리포 소유자)

### 1) Vercel 토큰 발급 → GitHub Secret 등록

https://vercel.com/account/tokens → **Create Token**
- Scope: `nculture_claud`가 속한 팀
- 만료: 프로토타입이면 No Expiration 또는 1년

리포 → **Settings → Secrets and variables → Actions → New repository secret**

| Secret 이름 | 값 |
|---|---|
| `VERCEL_TOKEN` | 위에서 발급한 토큰 |

### 2) 앱 환경변수를 Vercel에 등록

Supabase 키 같은 런타임 환경변수는 **GitHub이 아니라 Vercel 프로젝트**에 넣습니다.
워크플로의 `vercel pull` 단계가 자동으로 내려받습니다.

**CLI로 등록** (리포 루트에서):

```bash
vercel login

# production + preview 양쪽에 등록
for target in production preview; do
  printf 'https://zqyaitvnguyanhmnefvp.supabase.co' | vercel env add NEXT_PUBLIC_SUPABASE_URL $target
  printf '<anon-key>'                               | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY $target
  printf '<service-role-key>'                       | vercel env add SUPABASE_SERVICE_ROLE_KEY $target
done

vercel env ls        # 확인
```

> `printf`를 쓰는 이유: `echo`는 끝에 개행을 붙여서 키 값이 오염됩니다.

키 값은 Supabase 대시보드 → **Project Settings → API**에서 복사하세요.

**대시보드로 등록해도 됩니다**: Vercel → 프로젝트 → Settings → Environment Variables.
이때 **Production / Preview 양쪽 체크박스를 모두** 켜세요. Preview가 비면
PR 프리뷰 배포만 데모 모드로 뜹니다.

### 3) 확인

`main`에 아무 커밋이나 푸시 → GitHub **Actions** 탭에서 `Deploy Frontend` 실행 확인.
성공하면 실행 요약(Summary)에 배포 URL이 표시됩니다.

---

## 다른 개발자를 합류시키기

**GitHub ID를 Vercel에 맞출 필요는 없습니다.**
GitHub Actions는 *푸시한 사람의 계정*이 아니라 *리포지토리에 등록된 Secrets*로 실행되기 때문에,
누가 푸시하든 동일한 Vercel 토큰으로 배포됩니다.

필요한 건 딱 하나:

리포 → **Settings → Collaborators → Add people** → 상대방 GitHub 계정 초대 (Write 권한)

상대방은 초대 수락 후 clone → 커밋 → `git push origin main` 하면 자동 배포됩니다.
상대방의 `git config user.name` / `user.email`은 커밋 작성자 표기일 뿐 배포와 무관합니다.

상대방이 **하지 않아도 되는** 것:
- Vercel 계정 생성 / 로그인
- `vercel link`, `VERCEL_TOKEN` 발급
- `.env.local` 없이도 데모 모드로 로컬 실행 가능

---

## 배포 범위

| 대상 | 자동 배포 | 비고 |
|---|---|---|
| `nculture-platform/frontend` | ✅ | main 푸시 시 프로덕션, PR 시 프리뷰 |
| `supabase/migrations/**` | ❌ 수동 | Supabase 대시보드 SQL Editor에서 실행 |
| `supabase/functions/**` | ❌ 수동 | `supabase functions deploy <name>` |

Supabase는 되돌리기가 어려워 프로토타입 단계에서는 의도적으로 수동 유지합니다.
자세한 절차는 `nculture-platform/DEPLOY.md` 참고.

---

## 트러블슈팅

**빌드 실패 (타입 에러)**
`vercel build` 단계에서 잡힙니다. 배포는 안 되고 Actions만 빨간불 → 로컬에서
`cd nculture-platform/frontend && npm run build`로 재현 후 수정.

**`Error: No existing credentials found`**
`VERCEL_TOKEN` Secret이 없거나 만료. 토큰 재발급 후 Secret 갱신.

**`Project not found`**
`.github/workflows/deploy.yml`의 `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` 값이
실제 Vercel 프로젝트와 다름. `vercel project ls`로 확인 후 워크플로 수정.

**`No such file or directory` / 빌드가 엉뚱한 경로를 찾음**
`vercel` 명령을 `nculture-platform/frontend` 안에서 실행했을 때 발생.
Root Directory 설정과 중복되므로 **리포 루트에서** 실행해야 합니다.

**환경변수가 앱에 안 들어감**
Vercel 프로젝트 Environment Variables에서 Production/Preview 체크박스 확인.
`NEXT_PUBLIC_` 접두사가 없으면 브라우저에서 못 읽습니다.

**포크된 PR이 배포 안 됨**
의도된 동작입니다. 포크 PR은 Secrets에 접근할 수 없어 워크플로가 스킵됩니다.
협업자로 초대하고 같은 리포에 브랜치를 만들어 작업하세요.
