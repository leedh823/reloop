# 이미지 파일 가이드

이 폴더에는 Reloop 프로젝트에서 사용하는 이미지 파일들이 저장됩니다.

## 파일 구조

```
public/images/
├── logo.svg          # 로고 (SVG 형식 권장)
├── logo.png          # 로고 (PNG 형식, 필요시)
├── hero-image.png    # 히어로 섹션 메인 이미지
├── hero-image.jpg    # 히어로 섹션 메인 이미지 (JPG 형식)
└── favicon.ico       # 파비콘
```

## 사용 방법

### Next.js에서 이미지 사용

```tsx
import Image from 'next/image'

// SVG 로고
<Image src="/images/logo.svg" alt="Reloop" width={120} height={40} />

// 히어로 이미지
<Image src="/images/hero-image.png" alt="Hero" width={800} height={600} />
```

### 일반 img 태그 사용

```tsx
<img src="/images/logo.svg" alt="Reloop" />
```

## 권장 사양

### 로고
- **형식**: SVG (벡터) 또는 PNG (투명 배경)
- **크기**: 최소 240x80px (2x 해상도 대비)
- **색상**: 메인 컬러 #359DFE 사용

### 히어로 이미지
- **형식**: PNG 또는 JPG
- **크기**: 1920x1080px (Full HD) 또는 2560x1440px (2K)
- **비율**: 16:9 권장
- **용량**: 최적화 후 500KB 이하 권장

### 파비콘
- **형식**: ICO 또는 PNG
- **크기**: 32x32px, 16x16px 포함

## 이미지 최적화

배포 전에 이미지를 최적화하는 것을 권장합니다:
- [TinyPNG](https://tinypng.com/) - PNG/JPG 압축
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG 최적화
- Next.js Image 컴포넌트 사용 시 자동 최적화됨



