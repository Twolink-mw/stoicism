# 오늘의 스토아

매일 스토아 철학 명언 하나와 생각거리 질문을 보여 주는 웹앱입니다. 휴대폰 홈 화면에 설치할 수 있고, 한 번 열어 두면 오프라인에서도 동작합니다.

**바로 가기:** https://twolink-mw.github.io/stoicism/

## 기능

- 날짜에 따라 바뀌는 오늘의 명언 (100개, 100일 주기)
- 저자와 권·장까지 적은 출처, 오늘의 생각거리
- 명언 저장과 저장함
- 글자 크기 3단계
- 시스템 설정을 따르는 라이트/다크 모드
- 오프라인 실행

저장한 명언과 글자 크기는 사용하는 기기의 `localStorage`에만 저장됩니다.

## 휴대폰에 설치하기

- **iPhone:** Safari에서 주소를 열고 공유 → 홈 화면에 추가
- **Android:** Chrome에서 주소를 열고 메뉴(⋮) → 앱 설치 또는 홈 화면에 추가

## 로컬에서 실행하기

빌드 과정이 없는 정적 사이트입니다. 서비스 워커가 동작하려면 파일을 직접 열지 말고 로컬 서버로 실행하세요.

```sh
python -m http.server 8000
```

그런 다음 http://localhost:8000 을 엽니다.

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `index.html` | 화면 구조 |
| `styles.css` | 스타일 |
| `app.js` | 오늘의 명언 선택, 저장, 글자 크기 |
| `quotes.js` | 명언 데이터 |
| `sw.js` | 오프라인 실행을 위한 서비스 워커 |
| `manifest.webmanifest`, `icons/` | 홈 화면 설치 정보와 아이콘 |

## 수정하기

- **명언 추가:** `quotes.js`에 `id`, `text`, `author`, `source`, `reflection`을 갖춘 항목을 넣습니다. `id`는 저장함에서 쓰이므로 기존 값을 바꾸지 마세요. 명언 개수가 바뀌면 날짜별 명언 순서도 달라집니다.
- **배포:** `main` 브랜치에 푸시하면 GitHub Pages에 반영됩니다.
- **앱 파일을 고친 뒤:** `sw.js`의 `CACHE` 버전(`stoa-v1`)을 올려야 설치된 앱에 반영됩니다. 새 파일을 추가했다면 `ASSETS` 목록에도 넣으세요.

## 명언 출처와 번역

명언은 아래의 공개된 영역본을 보고 우리말로 옮겼습니다. 영역본을 거친 번역이며, 그리스어·라틴어 원전과 대조하거나 전문가가 검수한 번역은 아닙니다. 생각거리 질문은 원전 내용이 아니라 이 앱에서 덧붙인 것입니다.

- 마르쿠스 아우렐리우스, 《명상록》: George Long 영역, [Project Gutenberg](https://www.gutenberg.org/ebooks/15877)
- 세네카, 《루킬리우스에게 보낸 편지》: Richard Mott Gummere 영역, [Wikisource](https://en.wikisource.org/wiki/Moral_letters_to_Lucilius)
- 에픽테토스, 《강론》: George Long 영역, [The Internet Classics Archive](http://classics.mit.edu/Epictetus/discourses.html)
- 에픽테토스, 《엥케이리디온》: [The Internet Classics Archive](http://classics.mit.edu/Epictetus/epicench.html)
