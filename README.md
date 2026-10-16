# 판독지 스튜디오

나만의 영상의학과 판독문 생성기 모음입니다. 클릭으로 소견을 입력하면 판독문이 만들어집니다.

## 사용법

`index.html`을 브라우저로 열고, 왼쪽 메뉴에서 판독지 종류를 고릅니다.

> 환자 식별 정보는 입력하지 마세요. 판정 규칙과 문구는 직접 검수한 뒤 사용하세요.

## 판독지 목록

| 분류 | 판독지 | 상태 |
|---|---|---|
| Ultrasound | 갑상선 초음파 (K-TIRADS) | 사용 가능 |
| Ultrasound | 유방 초음파 (BI-RADS) | 사용 가능 |
| Ultrasound | 근골격계 초음파 | 준비 중 |
| Ultrasound | 상복부 초음파 (liver, GB, pancreas, spleen) | 사용 가능 |
| Mammography | Mammography (BI-RADS) | 사용 가능 |
| X-ray | 흉부 X-ray | 준비 중 |
| CT | 복부 CT | 준비 중 |
| MRI | MRI | 준비 중 |

## 내 저장소 (Supabase)

판독지는 **로그인해야** 쓸 수 있고, 누구나 이메일로 **회원가입**할 수 있습니다.
로그인하면 판독지마다 **템플릿, 판독문 기록, 자주 쓰는 문구**를 저장해서 어느 컴퓨터에서든 쓸 수 있습니다. 저장한 내용은 본인만 볼 수 있습니다.
연결 정보는 `lib/db.js`에 있습니다.

처음 한 번만 설정합니다.
1. Supabase 대시보드 > **SQL Editor**에서 `supabase/schema.sql` 내용을 붙여넣고 Run.
2. **Authentication > Sign In / Providers**에서 "Allow new users to sign up"을 켭니다.
3. 가입 메일 인증("Confirm email")은 켜 두는 것을 권장합니다. 인증 링크가 돌아올 주소는 **Authentication > URL Configuration > Site URL**에 사이트 주소(예: GitHub Pages 주소)로 적습니다.

> 저장소에도 환자 식별 정보(이름, 등록번호, 생년월일 등)는 절대 저장하지 마세요.

## 방명록

메뉴의 **Community > 방명록**에서 누구나 로그인 없이 글을 남기고 볼 수 있습니다. 삭제는 **관리자**만 할 수 있습니다.
처음 한 번 `supabase/guestbook.sql` 맨 아래의 이메일을 내 로그인 이메일로 바꾼 뒤 SQL Editor에서 실행합니다. (다시 실행해도 안전)

## 새 판독지 추가하기

1. 판독지 프로그램을 HTML 파일 하나로 만들어 `modules/` 폴더에 넣습니다.
2. `index.html`의 `MODULES` 목록에서 해당 항목에 `file:"modules/파일이름.html"`을 적습니다.
3. 모든 판독지에 공통으로 넣는 것 (`lib/store.js`)
   - `<details class="card" id="store"></details>`와 `Store.init({...})`: 로그인 확인과 내 저장소
   - Report의 복사 버튼 옆에 `<button onclick="Store.reset()">초기화</button>`
   - 음성 받아쓰기 (`lib/voice.js`): `<script src="../lib/voice.js">` 와 `Voice.attach({module:"…"})`. 판독지 용어 사전은 voice.js 의 `EXTRA` 에 추가

## 음성 받아쓰기

"기존 판독문 불러오기" 칸의 🎤 받아쓰기를 누르고 핵심 키워드만 말하면 판독문 용어로 바꿔 한 줄씩 넣습니다.
예: "우측 3시 유두 2 일 점 이 오벌 하이포에코익 노듈" → `Right 3H, 2cm 거리 1.2cm oval hypoechoic nodule`
확인한 뒤 **불러오기**를 누르면 입력 칸이 채워집니다. Chrome/Edge에서, 사이트 주소(https)로 열었을 때만 동작합니다.
음성은 브라우저 음성인식(Google)으로 처리되므로 환자 식별 정보는 말하지 마세요.

## 고친 표현 학습 (`lib/learn.js`, `lib/report.js`)

- **받아쓰기**: 받아쓴 줄을 고친 뒤 불러오기를 누르면 고친 단어·문장 형태를 기억했다가 다음 받아쓰기에 반영합니다.
- **Report**: Report 칸을 직접 고칠 수 있습니다(고치는 동안은 입력 칸을 바꿔도 덮어쓰지 않음, "자동 생성으로 되돌리기"로 해제). 고친 Report를 **복사**하면 자동으로 만든 문장과 비교해 고친 형태를 기억하고, 다음 Report부터 반영합니다. 늘 지우는 줄은 빠집니다.
- 좌우·숫자·Category·모양 등 환자마다 다른 사실을 바로잡은 수정은 학습하지 않습니다.
- 학습한 내용은 판독지별로 저장되며(로그인 시 저장소, 아니면 이 브라우저), 목록에서 하나씩 "잊기" 할 수 있습니다.
