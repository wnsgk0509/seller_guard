# AGENT.MD: 셀러가드 (SellerGuard) 마스터 에이전트 개발 지침서

> **문서 목적:** 본 문서는 모든 AI 에이전트(Antigravity, Cursor, Claude Code 등) 및 협업 개발자가 **셀러가드(SellerGuard)** 프로젝트의 기술 스펙, 아키텍처 원칙, 법적 방패막, 결제 연동 방식을 완전히 이해하고 일관된 표준 코드를 작성하도록 강제하는 마스터 지침서입니다.  
> **버전:** 1.0.0  
> **최종 수정일:** 2026-11-05  
> **프로젝트 루트:** `c:\Users\rndrn\money\seller_guard_extension\`  

---

## 1. 프로젝트 개요 및 핵심 정체성 (Identity)

* **서비스명:** 셀러가드 (SellerGuard)
* **정의:** 스마트스토어 & 쿠팡 셀러 전용 1초 상표권 및 분쟁 위험 사전 자가진단 레이더 (크롬 확장 프로그램)
* **타깃 사용자:** 스마트스토어, 쿠팡, 위탁판매, 해외구매대행 셀러 (초보~중급)
* **핵심 가치 제안:** "치킨 한 마리 값(연 39,000원 / 월 3,250원)으로 상품 등록 전 상표권 분쟁 위험을 1초 만에 사전 스크리닝"
* **절대 금기 마케팅 표현:** `원천 차단`, `100% 무조건 방어`, `법률 보증` ➔ 법률상 결과 보증으로 해석되어 피소 위험이 있으므로 절대 사용 금지.
* **표준 허용 표현:** **`1초 사전 자가진단 레이더`**, **`위험 키워드 사전 스크리닝 도구`**

---

## 2. 디렉토리 구조 및 역할

```text
c:\Users\rndrn\money\
├── agent.md                      # [본 문서] 마스터 에이전트 개발 지침서
├── seller_guard_spec.md          # 비즈니스 & 제품 기획 상세 스펙 (v1.1.0)
└── seller_guard_extension/       # 크롬 확장 프로그램 소스 루트 (Manifest V3)
    ├── manifest.json             # 확장 프로그램 설정 (Content Script, Storage, Action)
    ├── popup.html                # 브라우저 팝업 UI (독립 검사 및 라이선스 키 등록)
    ├── popup.css                 # 팝업 스타일링 (Tailwind-like Pretendard 테마)
    ├── popup.js                  # 팝업 로직 및 Gumroad 라이선스 검증 엔진
    ├── content.js                # [핵심] 스마트스토어/쿠팡 인페이지 실시간 감지 스크립트
    ├── content.css               # 인페이지 툴팁 및 레드 하이라이팅 스타일
    ├── config.js                 # 원격 셀렉터(Remote Config) 로더 및 로컬 캐싱
    └── icons/                    # 확장 프로그램 아이콘 (16, 48, 128px PNG)
```

---

## 3. 프론트엔드 엄격 코딩 규칙 (Hard Engineering Rules)

모든 에이전트는 스마트스토어(`sell.smartstore.naver.com`) 및 쿠팡 윙(`wing.coupang.com`) 대상 코드를 작성할 때 다음 4대 규칙을 반드시 준수해야 합니다.

### [규칙 1] React/Vue Virtual DOM 상태 강제 동기화 (`setNativeValue`)
스마트스토어와 쿠팡은 React/Vue 기반 SPA입니다. `input.value = ...`로 직접 DOM 값을 바꾸면 Virtual DOM과 어긋나 실제 저장 시 원래 값으로 되돌아가거나 폼 에러가 터집니다. 반드시 아래 표준 헬퍼 함수를 통해 값을 변경해야 합니다.

```javascript
/**
 * React/Vue 내부 Virtual DOM State를 강제로 동기화하는 표준 헬퍼
 * @param {HTMLInputElement|HTMLTextAreaElement} element 
 * @param {string} value 
 */
function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  
  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
  // React Synthetic Event 트리거
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}
```

### [규칙 2] 한글 IME 조합(Composition) 보호 및 디바운스
한글은 조합형 문자이므로 타이핑 중(`isComposing === true`)에 DOM을 조작하거나 정규식을 돌리면 자모가 분리(`ㄱㅡㄹㅣㅂㅌㅗㄱ`)되는 버그가 발생합니다.

```javascript
let debounceTimer = null;

function attachInputListener(inputElement, onCheckCallback) {
  // 1. 조합 시작/종료 추적
  let isComposing = false;
  inputElement.addEventListener('compositionstart', () => { isComposing = true; });
  inputElement.addEventListener('compositionend', () => {
    isComposing = false;
    triggerDebouncedCheck();
  });

  // 2. 입력 이벤트 핸들링 (디바운스 250ms)
  inputElement.addEventListener('input', () => {
    if (isComposing) return; // 조합 중일 때는 무시
    triggerDebouncedCheck();
  });

  function triggerDebouncedCheck() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onCheckCallback(inputElement.value);
    }, 250);
  }
}
```

### [규칙 3] 원격 셀렉터(Remote Config) 동적 로드
스마트스토어나 쿠팡의 HTML 클래스명이 바뀌었을 때 크롬 웹스토어 재심사(1~3일)를 기다리지 않고 서버에서 1초 만에 대응할 수 있도록, 원격 JSON에서 셀렉터를 가져와 로컬 캐싱합니다.

```javascript
const DEFAULT_CONFIG = {
  version: "2026.11.05",
  naver_selector: "input[placeholder*='상품명'], input[name='name'], input[id*='productName']",
  coupang_selector: "input[id*='vendorInventoryName'], input[name='productName']",
  remote_db_url: "https://rndrn.github.io/seller-guard/rules.json"
};

async function getRemoteConfig() {
  const cached = await chrome.storage.local.get(['remote_config', 'config_timestamp']);
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  if (cached.remote_config && (Date.now() - (cached.config_timestamp || 0) < ONE_DAY)) {
    return cached.remote_config;
  }

  try {
    const res = await fetch(DEFAULT_CONFIG.remote_db_url, { cache: 'no-cache' });
    if (res.ok) {
      const freshConfig = await res.json();
      await chrome.storage.local.set({ remote_config: freshConfig, config_timestamp: Date.now() });
      return freshConfig;
    }
  } catch (err) {
    console.warn('[SellerGuard] Remote config fetch failed, using default fallback.', err);
  }
  return DEFAULT_CONFIG;
}
```

### [규칙 4] MutationObserver 범위 엄격 격리
전체 `document.body`를 무분별하게 감시하지 말고, 상품 등록 폼 컨테이너 내부로 한정하여 브라우저 탭의 메모리 누수와 메인 스레드 병목을 원천 방지합니다.

---

## 4. 법적 방패막 (Legal Shield) 및 온보딩 모달 규격

약관규제법상의 위험을 방어하기 위해, 확장 프로그램 최초 설치 후 실행 시 **사용자 명시적 동의 스플래시 화면(Splash Screen)**을 반드시 렌더링해야 합니다.

### 필수 확인 문구:
```text
[필수 고지 사항]
1. 셀러가드는 법률 자문이나 특허청 공식 심사를 대신하지 않는 1차 사전 자가진단 보조 도구입니다.
2. 상표권 침해 여부는 법원 및 특허청의 고유 판단 권한이며, 프로그램 미감지(False Negative)로 인한 내용증명 수령, 합의금, 계정 정지 등에 대해 개발사는 어떠한 법적 책임도 부담하지 않습니다.
3. 배상 책임의 한도는 법률상 허용되는 한도 내에서 이용자가 지불한 실 결제 금액으로 제한됩니다.
```
* **동작:** 사용자가 **`[위 내용을 모두 숙지하였으며, 자가진단 보조 도구로 사용하는 것에 동의합니다]`** 체크박스 및 확인 버튼을 눌러야만 `chrome.storage.local.set({ legal_agreed: true })`가 기록되며 메인 기능이 해금됩니다.

---

## 5. 지속 가능한 BM & Gumroad 라이선스 키 검증 엔진

### 가격 정책:
* **무료 플랜:** 팝업 검사기 + 30대 핵심 고소 다발 단어 영구 무료 검사
* **프로 플랜 (메인 앵커링):** **연 39,000원** (월 3,250원 꼴 / 34% 할인 + PDF 증정)
* **프로 월간 플랜:** 월 4,900원

### Gumroad API 라이선스 키 검증 구현 규격:
```javascript
/**
 * Gumroad License Key 유효성 검증
 * @param {string} licenseKey 
 * @param {string} productPermalink e.g. "sellerguard_pro"
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function verifyGumroadLicense(licenseKey, productPermalink = "sellerguard_pro") {
  if (!licenseKey || licenseKey.trim().length < 8) {
    return { success: false, message: "올바른 라이선스 키 형식이 아닙니다." };
  }

  try {
    const res = await fetch("https://api.gumroad.com/v1/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product_permalink: productPermalink,
        license_key: licenseKey.trim(),
        increment_uses_count: "false"
      })
    });

    const data = await res.json();
    if (data.success && !data.purchase.refunded && !data.purchase.disputed) {
      await chrome.storage.local.set({
        is_pro: true,
        license_key: licenseKey.trim(),
        license_expires: data.purchase.subscription_ended_at || null,
        verified_at: Date.now()
      });
      return { success: true, message: "프로 라이선스가 성공적으로 활성화되었습니다! 🛡️" };
    } else {
      return { success: false, message: data.message || "유효하지 않거나 만료된 라이선스 키입니다." };
    }
  } catch (err) {
    return { success: false, message: "검증 서버 연결 실패. 인터넷 상태를 확인해주세요." };
  }
}
```

---

## 7. 에이전트 행동 및 코드 무결성 보존 규칙 (Agent Operational Hard Rules)

모든 AI 에이전트는 코드 작성 및 수정 시 다음 3대 행동 원칙을 절대적으로 준수해야 합니다.

### [원칙 1] 기존 코드 보존 및 임의 덮어쓰기 절대 금지 (Preserve Working Code)
* 이미 정상 작동 중인 기존 함수나 모듈을 에이전트의 임의 판단으로 삭제하거나 전체를 무단으로 재작성하지 않습니다.
* 기능 확장이나 버그 수정 시에는 **기존 로직의 인터페이스(I/O)를 최대한 유지하면서 점진적(Incremental)으로 수정**해야 합니다.
* 불필요하게 기존 주석이나 설정을 날리는 행위는 엄격히 금지됩니다.

### [원칙 2] 독단적 가정 및 임의 판단 금지 (No Unilateral Assumptions)
* 요구사항이 모호하거나 중요한 비즈니스 로직(가격 정책, 법적 문구, 데이터 스키마 등)을 변경해야 할 때는 **스스로 넘겨짚어 결정하지 말고, 반드시 사용자에게 확인을 요청**해야 합니다.
* "이게 더 좋을 것 같아서 바꿨습니다" 식의 무단 설계 변경은 일체 불허합니다.

### [원칙 3] 회귀 버그(Regression) 방지 및 사전 영향도 평가
* 코드를 한 줄이라도 수정할 때는 그 수정이 연관된 다른 파일(예: `popup.js` 수정이 `content.js`나 `manifest.json`에 미치는 영향)에 미치는 부작용을 사전에 검토하고 수정해야 합니다.

---

## 8. 표준 작업 완료 보고 양식 (Standard Work Report Template)

에이전트는 모든 파일 생성, 수정, 리팩토링 작업을 마칠 때마다 **반드시 아래 표준 양식에 맞추어 사용자에게 작업 내역을 투명하게 보고**해야 합니다.

```markdown
### 🛠️ [작업 완료 보고서] <작업명 / 기능명>

#### 1. 작업 개요 (What & Why)
* **수정 대상 파일:** `파일 경로 (file:///...)`
* **작업 목적:** 어떤 문제를 해결하거나 어떤 기능을 구현하기 위함인지 명시

#### 2. 구체적인 변경 내역 (How)
* **[기능 A]:** 기존 `<기존 상태>` ➔ 변경 `<수정된 내용>`
* **[기능 B]:** 신규 추가된 로직 및 헬퍼 함수 명시
* **보존된 기존 코드:** 기존 작동을 보장하기 위해 유지된 핵심 로직 설명

#### 3. 변경 전/후 핵심 코드 비교 (Diff Summary)
```javascript
// [Before: 기존 코드]
...

// [After: 수정된 코드]
...
```

#### 4. 검증 및 확인 방법 (How to Test)
1. 사용자가 브라우저나 환경에서 직접 테스트할 수 있는 구체적인 1, 2, 3단계 행동 가이드 제시
2. 예상되는 정상 결과(Expected Output) 기술
```

---

## 9. 개발 로드맵 및 향후 실행 태스크

- [x] `seller_guard_spec.md` v1.1.0 테크-리걸 감사 반영 완료
- [x] `agent.md` 풀스택 마스터 지침서 생성 (코드 보존 규칙 및 보고 양식 탑재)
- [ ] `seller_guard_extension/popup.html` 및 `popup.js` 고도화:
  - [ ] 최초 실행 시 법적 동의 Splash Screen 모달 탑재
  - [ ] Gumroad 라이선스 키 등록 탭 및 프로 상태 인디케이터 추가
- [ ] `seller_guard_extension/content.js` 개발:
  - [ ] `setNativeValue` React 동기화 탑재
  - [ ] 한글 IME 보호 및 250ms 디바운스 적용
  - [ ] 스마트스토어/쿠팡 인페이지 툴팁 UI 및 레드 하이라이팅 연동
- [ ] Remote Config JSON 배포용 파일 준비 (`rules.json`)

