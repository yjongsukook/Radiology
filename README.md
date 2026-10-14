# 판독지 스튜디오

나만의 영상의학과 판독문 생성기 모음입니다. 클릭으로 소견을 입력하면 판독문이 만들어집니다.

## 사용법

`index.html`을 브라우저로 열고, 왼쪽 메뉴에서 판독지 종류를 고릅니다.

> 환자 식별 정보는 입력하지 마세요. 판정 규칙과 문구는 직접 검수한 뒤 사용하세요.

## 판독지 목록

| 분류 | 판독지 | 상태 |
|---|---|---|
| Ultrasound | 갑상선 초음파 (K-TIRADS) | 사용 가능 |
| Ultrasound | 유방 초음파 | 준비 중 |
| Ultrasound | 근골격계 초음파 | 준비 중 |
| Ultrasound | 복부 초음파 | 준비 중 |
| X-ray | 흉부 X-ray | 준비 중 |
| CT | 복부 CT | 준비 중 |
| MRI | MRI | 준비 중 |

## 내 저장소 (Supabase)

로그인하면 판독지마다 **템플릿, 판독문 기록, 자주 쓰는 문구**를 저장해서 어느 컴퓨터에서든 쓸 수 있습니다.
연결 정보는 `lib/db.js`에 있습니다.

처음 한 번만 설정합니다.
1. Supabase 대시보드 > **SQL Editor**에서 `supabase/schema.sql` 내용을 붙여넣고 Run.
2. **Authentication > Users > Add user**로 내 계정(이메일, 비밀번호)을 만들고 "Auto Confirm User"를 체크.
3. **Authentication > Sign In / Providers**에서 "Allow new users to sign up"을 끕니다. (다른 사람이 가입하지 못하게)

> 저장소에도 환자 식별 정보(이름, 등록번호, 생년월일 등)는 절대 저장하지 마세요.

## 방명록

메뉴의 **Community > 방명록**에서 누구나 로그인 없이 글을 남기고 볼 수 있습니다. 삭제는 로그인한 사람만 할 수 있습니다.
처음 한 번 SQL Editor에서 `supabase/guestbook.sql`을 실행해야 합니다.

## 새 판독지 추가하기

1. 판독지 프로그램을 HTML 파일 하나로 만들어 `modules/` 폴더에 넣습니다.
2. `index.html`의 `MODULES` 목록에서 해당 항목에 `file:"modules/파일이름.html"`을 적습니다.
