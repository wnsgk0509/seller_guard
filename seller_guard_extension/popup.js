// 셀러가드 (SellerGuard) 상표권 & 로펌 고소 빈출 키워드 데이터베이스
// 한글/영문 동시 매칭 및 자연스러운 이커머스 키워드 치환 규칙
const TRADEMARK_RULES = [
  {
    name: "그립톡 (Griptok)",
    patterns: [/\b그립톡\b/gi, /그립톡/gi, /\bgriptok\b/gi, /griptok/gi],
    replacement: "핑거그립",
    smartReplace: (text) => {
      // 뒤에 '거치대'나 '홀더'가 이미 붙어있으면 '손잡이'로만 치환하여 "거치대 거치대" 방지
      return text.replace(/(그립톡|griptok)(\s*)(거치대|홀더)?/gi, (match, p1, p2, p3) => {
        return p3 ? `핑거그립${p2}${p3}` : `핑거그립 거치대`;
      });
    },
    reason: "(주)아이버스터 등록상표. 일반명사 오인으로 인한 내용증명 및 300만원 합의금 요구 1순위 단어.",
    risk: "치명적"
  },
  {
    name: "지비츠 (Jibbitz)",
    patterns: [/\b지비츠\b/gi, /지비츠/gi, /\bjibbitz\b/gi, /jibbitz/gi],
    replacement: "신발 파츠",
    smartReplace: (text) => {
      return text.replace(/(지비츠|jibbitz)(\s*)(파츠|참|장식)?/gi, (match, p1, p2, p3) => {
        return p3 ? `슈즈${p2}${p3}` : `신발 슈즈 파츠 장식`;
      });
    },
    reason: "크록스(Crocs) 사의 정식 등록상표. 신발 구멍 액세서리에 사용 시 무차별 고소 단골.",
    risk: "치명적"
  },
  {
    name: "나이키 (Nike)",
    patterns: [/\b나이키\b/gi, /나이키/gi, /\bnike\b/gi, /nike/gi],
    replacement: "스포츠",
    smartReplace: (text) => {
      // '나이키 스타일', 'nike 운동화' 등을 자연스러운 '애슬레틱 스포츠' 문맥으로 정제
      return text.replace(/(나이키|nike)(\s*)(스타일|풍|st)?/gi, "스포츠 애슬레틱");
    },
    reason: "글로벌 등록상표. 병행수입이나 레플리카/스타일 표기 시 상표법 위반 및 즉시 스토어 제재.",
    risk: "치명적"
  },
  {
    name: "아디다스 (Adidas)",
    patterns: [/\b아디다스\b/gi, /아디다스/gi, /\badidas\b/gi, /adidas/gi],
    replacement: "스포츠",
    smartReplace: (text) => {
      return text.replace(/(아디다스|adidas)(\s*)(스타일|풍|st)?/gi, "스트릿 스포츠");
    },
    reason: "글로벌 등록상표 및 삼선 디자인 표장 침해 단속 빈발.",
    risk: "치명적"
  },
  {
    name: "크록스 (Crocs)",
    patterns: [/\b크록스\b/gi, /크록스/gi, /\bcrocs\b/gi, /crocs/gi],
    replacement: "클로그 샌들",
    smartReplace: (text) => {
      return text.replace(/(크록스|crocs)(\s*)(샌들|슬리퍼)?/gi, (match, p1, p2, p3) => {
        return p3 ? `클로그${p2}${p3}` : `EVA 클로그 샌들`;
      });
    },
    reason: "크록스 사 등록상표. 구멍 뚫린 EVA 슬리퍼를 크록스로 부르면 상표권 침해.",
    risk: "치명적"
  },
  {
    name: "레고 (Lego)",
    patterns: [/\b레고\b/gi, /레고/gi, /\blego\b/gi, /lego/gi],
    replacement: "조립 블록",
    smartReplace: (text) => {
      return text.replace(/(레고|lego)(\s*)(호환|블록|블럭)?/gi, "미니 조립 블록");
    },
    reason: "'레고 호환' 표기 역시 특허청 및 법원 판례상 상표권 침해 단속 대상.",
    risk: "치명적"
  },
  {
    name: "버켄스탁 (Birkenstock)",
    patterns: [/\b버켄스탁\b/gi, /버켄스탁/gi, /\bbirkenstock\b/gi, /birkenstock/gi],
    replacement: "코르크 슬리퍼",
    smartReplace: (text) => {
      return text.replace(/(버켄스탁|birkenstock)(\s*)(슬리퍼|샌들)?/gi, "클래식 코르크 슬리퍼");
    },
    reason: "독일 버켄스탁 사 등록상표. 코르크 바닥 신발에 무단 사용 금지.",
    risk: "치명적"
  },
  {
    name: "샤넬 (Chanel)",
    patterns: [/\b샤넬\b/gi, /샤넬/gi, /\bchanel\b/gi, /chanel/gi],
    replacement: "클래식 럭셔리",
    smartReplace: (text) => {
      return text.replace(/(샤넬|chanel)(\s*)(스타일|라인|풍|st)?/gi, "모던 클래식 트위드");
    },
    reason: "하이엔드 명품 상표. '샤넬st' 표기 즉시 형사고소 및 계정 강제 폐쇄.",
    risk: "치명적"
  },
  {
    name: "포스트잇 (Post-it)",
    patterns: [/\b포스트잇\b/gi, /포스트잇/gi, /\bpost-?it\b/gi, /post-?it/gi],
    replacement: "점착 메모지",
    smartReplace: (text) => text.replace(/(포스트잇|post-?it)/gi, "점착식 메모지"),
    reason: "3M사의 독점 등록상표. 일반명사 '점착 메모지' 사용 필수.",
    risk: "높음"
  },
  {
    name: "스카치테이프 (Scotch Tape)",
    patterns: [/\b스카치테이프\b/gi, /스카치테이프/gi, /\bscotch\b/gi],
    replacement: "투명 테이프",
    smartReplace: (text) => text.replace(/(스카치테이프|스카치\s*테이프)/gi, "투명 점착 테이프"),
    reason: "3M사의 등록상표.",
    risk: "높음"
  },
  {
    name: "밴드에이드 (Band-Aid)",
    patterns: [/\b밴드에이드\b/gi, /밴드에이드/gi, /\bband-?aid\b/gi],
    replacement: "일회용 반창고",
    smartReplace: (text) => text.replace(/(밴드에이드|band-?aid)/gi, "일회용 위생 반창고"),
    reason: "존슨앤드존슨 사의 등록상표.",
    risk: "높음"
  },
  {
    name: "보톡스 (Botox)",
    patterns: [/\b보톡스\b/gi, /보톡스/gi, /\bbotox\b/gi],
    replacement: "펩타이드 탄력",
    smartReplace: (text) => text.replace(/(보톡스|botox)(\s*)(효과|크림|앰플)?/gi, "리프팅 탄력 에센스"),
    reason: "엘러간 사 등록상표. 화장품에 표기 시 과대광고 및 상표법 동시 단속.",
    risk: "치명적"
  },
  {
    name: "스타일러 (Styler)",
    patterns: [/\b스타일러\b/gi, /스타일러/gi, /\bstyler\b/gi],
    replacement: "의류관리기",
    smartReplace: (text) => text.replace(/(스타일러|styler)/gi, "의류관리기 케어"),
    reason: "LG전자의 독점 등록상표. '의류관리기'가 표준 명칭.",
    risk: "높음"
  },
  {
    name: "락앤락 (Lock&Lock)",
    patterns: [/\b락앤락\b/gi, /락앤락/gi, /\blockn?lock\b/gi],
    replacement: "밀폐용기",
    smartReplace: (text) => text.replace(/(락앤락|lockn?lock)/gi, "안심 밀폐용기"),
    reason: "(주)락앤락의 등록상표.",
    risk: "높음"
  }
];

// 이커머스 상품명 후처리 정제 함수 (중복 단어 및 어색한 공백 제거)
function cleanProductTitle(rawText) {
  let cleaned = rawText;

  // 1. 연속된 공백 하나로 정리
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 2. 같은 단어가 연속으로 반복되는 현상 제거 (예: "거치대 거치대" -> "거치대")
  const words = cleaned.split(' ');
  const dedupedWords = [];
  
  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const prev = dedupedWords[dedupedWords.length - 1];
    
    if (prev && (prev === current || prev.includes(current) && current.length > 2)) {
      continue; // 중복 건너뜀
    }
    dedupedWords.push(current);
  }

  return dedupedWords.join(' ');
}

// DOM Elements
const productInput = document.getElementById('productInput');
const scanBtn = document.getElementById('scanBtn');
const clearBtn = document.getElementById('clearBtn');
const resultSection = document.getElementById('resultSection');
const statusBanner = document.getElementById('statusBanner');
const statusIcon = document.getElementById('statusIcon');
const statusTitle = document.getElementById('statusTitle');
const statusDesc = document.getElementById('statusDesc');
const riskList = document.getElementById('riskList');
const safeTitleText = document.getElementById('safeTitleText');
const copyBtn = document.getElementById('copyBtn');
const exampleTags = document.querySelectorAll('.example-tag');

// Legal Modal Elements
const legalModal = document.getElementById('legalModal');
const legalAgreeCheck = document.getElementById('legalAgreeCheck');
const legalAgreeBtn = document.getElementById('legalAgreeBtn');

// 1. 법적 면책 최초 동의 상태 확인 (Splash Screen)
function initLegalCheck() {
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['legal_agreed'], (result) => {
      if (!result.legal_agreed) {
        legalModal.classList.remove('hidden');
      }
    });
  }
}

// 체크박스 활성화 시 버튼 언락
if (legalAgreeCheck && legalAgreeBtn) {
  legalAgreeCheck.addEventListener('change', (e) => {
    legalAgreeBtn.disabled = !e.target.checked;
  });

  legalAgreeBtn.addEventListener('click', () => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ 
        legal_agreed: true,
        legal_agreed_at: new Date().toISOString()
      }, () => {
        legalModal.classList.add('hidden');
      });
    } else {
      legalModal.classList.add('hidden');
    }
  });
}

// 최초 실행 확인 트리거
initLegalCheck();

// Quick Examples Click
exampleTags.forEach(tag => {
  tag.addEventListener('click', () => {
    productInput.value = tag.getAttribute('data-text');
    analyzeKeywords();
  });
});

// Clear Button
clearBtn.addEventListener('click', () => {
  productInput.value = '';
  resultSection.classList.add('hidden');
  productInput.focus();
});

// Scan Button Click
scanBtn.addEventListener('click', analyzeKeywords);

// Main Analysis Function
function analyzeKeywords() {
  const text = productInput.value.trim();
  if (!text) {
    alert('검사할 상품명을 입력해주세요!');
    productInput.focus();
    return;
  }

  const detectedRisks = [];
  let safeTitle = text;

  // 1. 모든 규칙에 대해 한글 및 영문 대소문자 검사
  TRADEMARK_RULES.forEach(rule => {
    let matched = false;
    let matchedKeyword = "";

    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        matched = true;
        matchedKeyword = match[0];
        break;
      }
    }

    if (matched) {
      detectedRisks.push({
        word: matchedKeyword,
        ruleName: rule.name,
        alt: rule.replacement,
        reason: rule.reason,
        risk: rule.risk
      });

      // 지능형 문맥 치환 실행
      safeTitle = rule.smartReplace(safeTitle);
    }
  });

  // 2. 이커머스 상품명 문맥 정제 (중복 어휘 제거 및 공백 다듬기)
  safeTitle = cleanProductTitle(safeTitle);

  // 3. 렌더링
  renderResults(detectedRisks, safeTitle, text);
}

function renderResults(detectedRisks, safeTitle, originalText) {
  resultSection.classList.remove('hidden');
  riskList.innerHTML = '';

  if (detectedRisks.length > 0) {
    // Danger State
    statusBanner.className = 'status-banner danger';
    statusIcon.textContent = '🚨';
    statusTitle.textContent = `위험 상표권 ${detectedRisks.length}건 적발`;
    statusDesc.textContent = '로펌 내용증명 및 스마트스토어 강제 삭제 위험이 높습니다!';

    detectedRisks.forEach(item => {
      const card = document.createElement('div');
      card.className = 'risk-card';
      card.innerHTML = `
        <div class="risk-header">
          <span class="risk-word">⚠️ "${item.word}" (${item.ruleName})</span>
          <span class="risk-tag">위험도: ${item.risk}</span>
        </div>
        <p class="risk-reason">${item.reason}</p>
        <div class="risk-replacement">
          👉 자연스러운 이커머스 대체어: <strong>${item.alt}</strong>
        </div>
      `;
      riskList.appendChild(card);
    });

    safeTitleText.textContent = safeTitle;
  } else {
    // Safe State
    statusBanner.className = 'status-banner safe';
    statusIcon.textContent = '✅';
    statusTitle.textContent = '등록된 주요 고소 상표권 없음';
    statusDesc.textContent = '주요 위험 단어(한글/영문)가 발견되지 않은 안전한 상품명입니다.';

    riskList.innerHTML = `
      <div style="font-size: 11.5px; color: #16a34a; padding: 8px 12px; background: #f0fdf4; border-radius: 8px;">
        💡 그립톡(Griptok), 지비츠(Jibbitz), 나이키(Nike), 레고(Lego) 등 고소 빈출 등록상표가 포함되어 있지 않습니다.
      </div>
    `;

    safeTitleText.textContent = originalText;
  }

  // Reset Copy Button State
  copyBtn.textContent = '📋 원클릭 복사';
  copyBtn.classList.remove('copied');
}

// Copy Action
copyBtn.addEventListener('click', () => {
  const textToCopy = safeTitleText.textContent;
  if (!textToCopy) return;

  navigator.clipboard.writeText(textToCopy).then(() => {
    copyBtn.textContent = '✅ 안전 상품명 복사 완료!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = '📋 원클릭 복사';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
});
