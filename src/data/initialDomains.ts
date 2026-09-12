export interface DomainItem {
  id: string;
  domain: string;
  status: 'active' | 'grace' | 'pendingDelete' | 'available' | 'backlog';
  category: 'VIP Watchlist' | 'Luxury & DMC' | 'Tours & Travel' | 'Incentive';
  registeredDate?: string;
  expirationDate?: string;
  daysLeft?: number;
  registrar?: string;
  priceEst?: string;
  note?: string;
  priority: 'P0' | 'P1' | 'P2';
  isVip?: boolean;
}

export const INITIAL_DOMAINS: DomainItem[] = [
  {
    id: '1',
    domain: 'travelvietnam.com',
    status: 'active',
    category: 'VIP Watchlist',
    registeredDate: '2002-09-23',
    expirationDate: '2026-09-23T16:42:00Z',
    daysLeft: 11,
    registrar: 'Namecheap, Inc.',
    priceEst: '$5,000 - $15,000',
    note: 'Tên miền 24 năm tuổi cực VIP. Đang ghim giám sát từng giờ!',
    priority: 'P0',
    isVip: true
  },
  {
    id: '2',
    domain: 'luxurytour.com',
    status: 'active',
    category: 'Luxury & DMC',
    registeredDate: '2005-10-08',
    expirationDate: '2026-10-08T12:00:00Z',
    daysLeft: 26,
    registrar: 'GoDaddy',
    priceEst: '$2,500 - $8,000',
    note: 'Sắp hết hạn trong tháng tới, theo dõi khả năng gia hạn.',
    priority: 'P0',
    isVip: false
  },
  {
    id: '3',
    domain: 'vietnamluxury.com',
    status: 'active',
    category: 'VIP Watchlist',
    registeredDate: '2008-11-11',
    expirationDate: '2026-11-11T14:30:00Z',
    daysLeft: 60,
    registrar: 'Network Solutions',
    priceEst: '$3,000 - $10,000',
    note: 'Domain thương hiệu cực mạnh cho thị trường Inbound Luxury.',
    priority: 'P1',
    isVip: true
  },
  {
    id: '4',
    domain: 'tourvietnam.com',
    status: 'active',
    category: 'Tours & Travel',
    registeredDate: '2010-11-15',
    expirationDate: '2026-11-15T09:00:00Z',
    daysLeft: 64,
    registrar: 'Dynadot',
    priceEst: '$1,500 - $4,000',
    note: 'Từ khóa tour Inbound cốt lõi.',
    priority: 'P1',
    isVip: false
  },
  {
    id: '5',
    domain: 'asiapremiervoyages.com',
    status: 'grace',
    category: 'Luxury & DMC',
    registeredDate: '2021-08-20',
    expirationDate: '2026-08-20T00:00:00Z',
    daysLeft: -23,
    registrar: 'Namecheap',
    priceEst: '$800 - $2,000',
    note: 'Đã hết hạn hơn 20 ngày, chủ chưa gia hạn. Đang trong Grace Period.',
    priority: 'P0',
    isVip: false
  },
  {
    id: '6',
    domain: 'indochinacurated.com',
    status: 'pendingDelete',
    category: 'Luxury & DMC',
    registeredDate: '2022-07-15',
    expirationDate: '2026-07-15T00:00:00Z',
    daysLeft: -58,
    registrar: 'DropCatch Holding',
    priceEst: '$600 - $1,500',
    note: 'Đang ở trạng thái Pending Delete! Chuẩn bị rụng tự do trong 2-3 ngày.',
    priority: 'P0',
    isVip: true
  },
  {
    id: '7',
    domain: 'vietnamcustom.com',
    status: 'available',
    category: 'Tours & Travel',
    priceEst: '$10.99/năm',
    note: 'Chưa ai đăng ký! Tên miền 2 từ đẹp cho dòng tour Bespoke/Customized.',
    priority: 'P1',
    isVip: false
  },
  {
    id: '8',
    domain: 'vietnampremium.com',
    status: 'available',
    category: 'VIP Watchlist',
    priceEst: '$10.99/năm',
    note: 'Trống 100%! Đăng ký ngay giá gốc.',
    priority: 'P0',
    isVip: true
  },
  {
    id: '9',
    domain: 'vietnamcurated.com',
    status: 'available',
    category: 'Luxury & DMC',
    priceEst: '$10.99/năm',
    note: 'Trống! Chuẩn định vị tour Curated Private Travel.',
    priority: 'P1',
    isVip: false
  },
  {
    id: '10',
    domain: 'vietnamluxurydmc.com',
    status: 'available',
    category: 'Luxury & DMC',
    priceEst: '$10.99/năm',
    note: 'Trống! Đỉnh cao cho mảng B2B DMC Inbound.',
    priority: 'P0',
    isVip: true
  },
  {
    id: '11',
    domain: 'luxurydmcvietnam.com',
    status: 'available',
    category: 'Luxury & DMC',
    priceEst: '$10.99/năm',
    note: 'Trống! Đăng ký bảo hộ thương hiệu song song.',
    priority: 'P1',
    isVip: false
  },
  {
    id: '12',
    domain: 'vietnamcustomtour.com',
    status: 'available',
    category: 'Tours & Travel',
    priceEst: '$10.99/năm',
    note: 'Trống! Phục vụ SEO Inbound Âu - Mỹ - Úc.',
    priority: 'P1',
    isVip: false
  },
  {
    id: '13',
    domain: 'curatedvietnamtravel.com',
    status: 'available',
    category: 'Luxury & DMC',
    priceEst: '$10.99/năm',
    note: 'Trống! Dòng sản phẩm may đo cao cấp.',
    priority: 'P1',
    isVip: false
  },
  {
    id: '14',
    domain: 'vietnamincentivetravel.com',
    status: 'available',
    category: 'Incentive',
    priceEst: '$10.99/năm',
    note: 'Trống! MICE & Incentive cho thị trường Ấn Độ và Âu.',
    priority: 'P1',
    isVip: false
  },
  {
    id: '15',
    domain: 'hanoiluxurydmc.com',
    status: 'backlog',
    category: 'Luxury & DMC',
    note: 'Chờ phân tích RDAP tự động và ước tính traffic.',
    priority: 'P2',
    isVip: false
  },
  {
    id: '16',
    domain: 'saigonprivatetravel.com',
    status: 'backlog',
    category: 'Tours & Travel',
    note: 'Danh sách chờ quét đợt tiếp theo.',
    priority: 'P2',
    isVip: false
  }
];
