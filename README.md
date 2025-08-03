# 🎯 오늘 뭐하지?

할 일을 무작위로 뽑고, AI가 해야 할 이유와 하지 말아야 할 이유를 설명해주는 웹사이트입니다.

## ✨ 기능

- 📝 **할 일 관리**: 입력, 추가, 삭제 및 실시간 유효성 검사 (최대 5개)
- 🎲 **무작위 선택**: 애니메이션과 함께 랜덤 선택
- 🤖 **AI 이유 생성**: Gemini AI가 3가지 강도(부드럽게/일반적/강하게)로 설득력 있는 이유 설명
- 💳 **결과 카드**: 선택된 할 일은 강조, 나머지는 흐리게 표시
- ⚙️ **API 키 내장**: 코드에 직접 설정하여 간편하게 사용
- 🎚️ **강도 조절**: 부드럽게 🌸 / 일반적 💬 / 강하게 🔥 3단계 설득 모드
- 🎯 **토스트 알림**: 사용자 행동에 대한 즉각적인 피드백
- ⌨️ **키보드 단축키**: Enter, Escape, Ctrl+Enter 지원
- 📱 **반응형 디자인**: 데스크톱과 모바일 완벽 지원
- ♿ **접근성**: 스크린 리더 및 키보드 내비게이션 지원

## 🚀 시작하기

### 로컬에서 실행

1. 프로젝트 클론 또는 다운로드
2. 프로젝트 폴더로 이동
3. 다음 명령어 중 하나 실행:

```bash
# 간단한 HTTP 서버로 실행
npm run start

# 라이브 리로드가 지원되는 개발 서버로 실행
npm run dev

# 또는 Python을 사용하는 경우
python3 -m http.server 3000
```

4. 브라우저에서 `http://localhost:3000` 접속

### 필요한 패키지 설치 (선택사항)

```bash
# HTTP 서버 도구 설치
npm install -g http-server live-server
```

## 🔧 개발 설정

### Gemini API 연동

1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급 (무료!)
2. `scripts/main.js` 파일의 8번째 줄 수정:
   ```javascript
   const DEFAULT_API_KEY = 'AIzaSy...'; // 여기에 본인의 API 키 입력
   ```
3. 웹페이지 새로고침하면 자동으로 적용됨

**참고**: API 키는 브라우저에서만 동작하며 외부로 전송되지 않습니다.

### 개발 도구

개발 중에는 브라우저 콘솔에서 다음 명령어를 사용할 수 있습니다:

```javascript
// 샘플 할 일 추가
devTools.addSampleTodos();

// 할 일 모두 삭제
devTools.clearTodos();

// 현재 상태 확인
devTools.showCurrentState();

// API 연결 테스트
devTools.testApi();
```

## 📁 프로젝트 구조

```
├── index.html          # 메인 HTML 파일
├── styles/
│   └── main.css        # 메인 스타일시트
├── scripts/
│   └── main.js         # 메인 JavaScript 파일
├── package.json        # 프로젝트 설정
└── README.md          # 프로젝트 설명
```

## 🎨 디자인 특징

- **폰트**: Pretendard (한국어 최적화)
- **색상**: 미니멀한 색상 팔레트
- **레이아웃**: 모바일 우선 반응형 디자인
- **애니메이션**: 부드러운 전환 효과

## 🚧 개발 단계

- [x] **1단계**: 프로젝트 초기 설정 및 기본 구조
- [x] **2단계**: 할 일 입력 인터페이스 구현
- [x] **3단계**: 랜덤 선택 로직 구현
- [x] **4단계**: Gemini API 연동
- [x] **5단계**: 결과 카드 UI 구현
- [x] **6단계**: 추가 기능 및 마무리

## 📝 라이센스

MIT License

## 🤝 기여하기

이슈나 개선사항이 있으시면 언제든지 제안해주세요!