'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Clock,
  Search,
  Plus,
  Moon,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  FolderTree,
  Compass,
  Briefcase,
  Layers,
  Sparkles,
  Bot,
  Zap,
  BarChart3,
  Calendar,
  ListFilter,
  Menu,
  X
} from 'lucide-react';
import { INITIAL_DOMAINS, DomainItem } from '../data/initialDomains';

export default function DomainHunterDashboard() {
  const [domains, setDomains] = useState<DomainItem[]>(INITIAL_DOMAINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mobileTab, setMobileTab] = useState<'all' | 'backlog' | 'active' | 'pending' | 'available'>('all');
  const [currentTime, setCurrentTime] = useState<string>('12:00:00');
  const [currentDate, setCurrentDate] = useState<string>('Thứ Bảy, 12 tháng 9, 2026');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN'));
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString('vi-VN', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial domain list from backend cache
  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.domains && data.domains.length > 0) {
          setDomains(data.domains);
        }
      })
      .catch(err => console.error('Error loading domains:', err));
  }, []);

  // Quick Live RDAP Check
  const handleQuickCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = quickInput.trim().toLowerCase();
    if (!target) return;

    const domainName = target.includes('.') ? target : `${target}.com`;
    setIsScanning(true);
    setScanMessage(`Đang quét RDAP Verisign cho ${domainName}...`);

    try {
      const res = await fetch(`/api/check?domain=${encodeURIComponent(domainName)}`);
      const data = await res.json();

      if (data.status === 'available') {
        const newItem: DomainItem = {
          id: String(Date.now()),
          domain: domainName,
          status: 'available',
          category: 'Tours & Travel',
          priceEst: '$10.99/năm',
          note: 'Vừa quét: Tên miền đang tự do, có thể mua ngay!',
          priority: 'P0',
          isVip: false
        };
        setDomains(prev => [newItem, ...prev.filter(d => d.domain !== domainName)]);
        setScanMessage(` ${domainName} ĐANG TRỐNG! Đã thêm vào cột [Có Thể Mua Ngay].`);
      } else if (data.status === 'registered') {
        let col: DomainItem['status'] = 'active';
        if (data.sub_status === 'pendingDelete') col = 'pendingDelete';
        else if (data.sub_status === 'redemptionPeriod' || data.sub_status === 'expired_grace') col = 'grace';

        const newItem: DomainItem = {
          id: String(Date.now()),
          domain: domainName,
          status: col,
          category: 'VIP Watchlist',
          registeredDate: data.registered_date ? data.registered_date.slice(0, 10) : undefined,
          expirationDate: data.expiration_date,
          daysLeft: data.days_left,
          registrar: data.registrar,
          priceEst: '$1,000 - $5,000',
          note: `Trạng thái: ${data.sub_status}. Hết hạn: ${data.expiration_date ? data.expiration_date.slice(0, 10) : 'N/A'} (còn ${data.days_left} ngày).`,
          priority: (data.days_left && data.days_left <= 30) ? 'P0' : 'P1',
          isVip: true
        };
        setDomains(prev => [newItem, ...prev.filter(d => d.domain !== domainName)]);
        setScanMessage(` ${domainName}: Đã đăng ký (${data.sub_status}) - Còn ${data.days_left} ngày.`);
      } else {
        setScanMessage(` Không thể kiểm tra ${domainName} (${data.message || 'Lỗi mạng'}).`);
      }
    } catch (err: any) {
      setScanMessage(` Lỗi kết nối RDAP: ${err.message}`);
    } finally {
      setIsScanning(false);
      setQuickInput('');
    }
  };

  // Move status handler
  const moveDomain = (id: string, newStatus: DomainItem['status']) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  // Delete handler
  const deleteDomain = (id: string) => {
    setDomains(prev => prev.filter(d => d.id !== id));
  };

  // Filtered list
  const filteredDomains = domains.filter(d => {
    const matchesSearch = d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.note && d.note.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'dropped_today') return d.isDroppedToday || d.status === 'available' || d.status === 'pendingDelete';
    if (activeFilter === 'p0') return d.priority === 'P0';
    if (activeFilter === 'vip') return d.isVip;
    if (activeFilter === 'available') return d.status === 'available';
    if (activeFilter === 'pending') return d.status === 'pendingDelete' || d.status === 'grace';
    if (activeFilter === 'active') return d.status === 'active';
    return true;
  });

  // Column counts
  const backlogList = filteredDomains.filter(d => d.status === 'backlog');
  const activeList = filteredDomains.filter(d => d.status === 'active');
  const pendingList = filteredDomains.filter(d => d.status === 'grace' || d.status === 'pendingDelete');
  const availableList = filteredDomains.filter(d => d.status === 'available');

  const totalDroppedToday = domains.filter(d => d.isDroppedToday || d.status === 'available' || d.status === 'pendingDelete').length;
  const totalP0 = domains.filter(d => d.priority === 'P0').length;
  const totalAvailable = domains.filter(d => d.status === 'available').length;
  const totalPending = domains.filter(d => d.status === 'pendingDelete' || d.status === 'grace').length;
  const totalActive = domains.filter(d => d.status === 'active').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#121214' : 'var(--bg-main)', color: isDarkMode ? '#F4F4F5' : '#18181B', position: 'relative' }}>
      
      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
        />
      )}

      {/* 1. SIDEBAR (Responsive Desktop + Mobile Drawer) */}
      <aside style={{
        width: '260px',
        backgroundColor: isDarkMode ? '#18181B' : '#FFFFFF',
        borderRight: '2px solid #18181B',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        gap: '24px',
        flexShrink: 0,
        position: sidebarOpen ? 'fixed' : 'relative',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        boxShadow: sidebarOpen ? '4px 0px 0px #18181B' : undefined
      }}
      className={sidebarOpen ? '' : 'desktop-only'}
      >
        {/* User profile with close button for mobile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            backgroundColor: isDarkMode ? '#27272A' : '#FBF9F5',
            border: '2px solid #18181B',
            borderRadius: '12px',
            boxShadow: '2px 2px 0px #18181B',
            flex: 1
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#F26522',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px',
              border: '1.5px solid #18181B'
            }}>
              DT
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                Đồng Minh Tuấn
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#A1A1AA' : '#64748B', fontWeight: 600 }}>
                Co-founder & Dir.
              </div>
            </div>
          </div>

          {/* Close mobile drawer */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="mobile-only brutal-btn brutal-btn-white"
            style={{ padding: '8px', minHeight: 'unset' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
          
          {/* Section: Business Operations */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
              BUSINESS OPERATIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                color: isDarkMode ? '#D4D4D8' : '#475569'
              }}>
                <BarChart3 size={16} />
                CEO Dashboard
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                backgroundColor: '#F26522',
                color: '#FFFFFF',
                border: '1.5px solid #18181B',
                boxShadow: '2px 2px 0px #18181B',
                cursor: 'pointer'
              }}>
                <Globe size={16} />
                Domain Hunter
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                color: isDarkMode ? '#D4D4D8' : '#475569'
              }}>
                <Briefcase size={16} />
                Tasks & Operations
              </div>
            </div>
          </div>

          {/* Section: Business Context */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
              BUSINESS CONTEXT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                color: isDarkMode ? '#D4D4D8' : '#475569'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Compass size={16} />
                  Trip Builder
                </div>
                <span className="brutal-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>AAT</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                color: isDarkMode ? '#D4D4D8' : '#475569'
              }}>
                <Layers size={16} />
                CRM & Leads
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                color: isDarkMode ? '#D4D4D8' : '#475569'
              }}>
                <Zap size={16} />
                Market Intelligence
              </div>
            </div>
          </div>

          {/* Section: AI Agent & Scanner */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
              AI INSIGHT & RADAR
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                color: isDarkMode ? '#D4D4D8' : '#475569'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bot size={16} />
                  Tony Digital Twin
                </div>
                <span className="brutal-badge" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>AI</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                color: isDarkMode ? '#D4D4D8' : '#475569'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} />
                  Verisign RDAP
                </div>
                <span className="brutal-badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          padding: '12px',
          border: '2px solid #18181B',
          borderRadius: '10px',
          backgroundColor: isDarkMode ? '#27272A' : '#FFF7ED',
          fontSize: '11px',
          fontWeight: 700
        }}>
          <div style={{ color: '#F26522', marginBottom: '4px' }}>ABSOLUTE ASIA TRAVEL</div>
          <div style={{ color: isDarkMode ? '#A1A1AA' : '#64748B', fontWeight: 500 }}>
            Domain Hunter V1.0 · Responsive
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Top Header Bar */}
        <header style={{
          minHeight: '64px',
          borderBottom: '2px solid #18181B',
          backgroundColor: isDarkMode ? '#18181B' : '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          gap: '12px'
        }}>
          
          {/* Mobile hamburger + Logo Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-only brutal-btn brutal-btn-white"
              style={{ padding: '8px' }}
              title="Mở menu"
            >
              <Menu size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: '#F26522',
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '12px',
                border: '1.5px solid #18181B'
              }}>
                AAT
              </div>
              <span style={{ fontWeight: 800, fontSize: '15px' }}>Domain Hunter</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="search-container" style={{
            position: 'relative',
            width: '320px',
            flexGrow: 1,
            maxWidth: '480px'
          }}>
            <input
              type="text"
              placeholder="Tìm kiếm domain, tag... ⌘K"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                border: '2px solid #18181B',
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#27272A' : '#FBF9F5',
                color: isDarkMode ? '#FFFFFF' : '#18181B',
                fontWeight: 600,
                fontSize: '13px',
                outline: 'none',
                boxShadow: '2px 2px 0px #18181B'
              }}
            />
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '10px', color: '#64748B' }} />
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="brutal-btn brutal-btn-white"
              style={{ padding: '8px', borderRadius: '8px' }}
              title="Đổi giao diện"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Time badge (desktop) */}
            <div className="desktop-only" style={{
              border: '2px solid #18181B',
              borderRadius: '8px',
              padding: '4px 10px',
              backgroundColor: isDarkMode ? '#27272A' : '#FBF9F5',
              boxShadow: '2px 2px 0px #18181B',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace' }}>{currentTime}</div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>{currentDate}</div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 3. METRIC SUMMARY CARDS (6 Cards - Mobile 2 columns) */}
          <div className="metric-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px'
          }}>
            {/* Card 1: Backlog */}
            <div className="brutal-box" style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#1F1F23' : '#FFFFFF' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>CHỜ SĂN</div>
              <div className="metric-card-val" style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 2px 0', color: '#18181B' }}>
                {backlogList.length}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Chờ phân tích RDAP</div>
            </div>

            {/* Card 2: Active Monitoring */}
            <div className="brutal-box" style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#1F1F23' : '#FFFFFF' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.5px' }}>ĐANG THEO DÕI</div>
              <div className="metric-card-val" style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 2px 0', color: '#2563EB' }}>
                {totalActive}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Quét tự động hàng ngày</div>
            </div>

            {/* Card 3: Priority P0 */}
            <div className="brutal-box" style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#1F1F23' : '#FFFFFF', borderColor: '#EF4444' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#EF4444', letterSpacing: '0.5px' }}>ƯU TIÊN (P0)</div>
              <div className="metric-card-val" style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 2px 0', color: '#EF4444' }}>
                {totalP0}
              </div>
              <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>Có travelvietnam.com</div>
            </div>

            {/* Card 4: Pending Delete */}
            <div className="brutal-box" style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#1F1F23' : '#FFFFFF' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.5px' }}>PENDING (5 NGÀY)</div>
              <div className="metric-card-val" style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 2px 0', color: '#DC2626' }}>
                {totalPending}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Sắp rụng tự do</div>
            </div>

            {/* Card 5: Available */}
            <div className="brutal-box" style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#1F1F23' : '#FFFFFF' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#059669', letterSpacing: '0.5px' }}>MUA NGAY</div>
              <div className="metric-card-val" style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 2px 0', color: '#059669' }}>
                {totalAvailable}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Trống giá gốc (~$10)</div>
            </div>

            {/* Card 6: Total */}
            <div className="brutal-box" style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#1F1F23' : '#FFFFFF' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#F26522', letterSpacing: '0.5px' }}>TỔNG SỐ</div>
              <div className="metric-card-val" style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 2px 0', color: '#F26522' }}>
                {domains.length}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Tên miền trong kho</div>
            </div>
          </div>

          {/* 4. STRATEGIC PROMPT BOX */}
          <div style={{
            backgroundColor: isDarkMode ? '#1E293B' : '#FFF7ED',
            border: '2px solid #18181B',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '2px 2px 0px #18181B'
          }}>
            <span className="brutal-badge" style={{ backgroundColor: '#F26522', color: '#FFFFFF', padding: '3px 8px', flexShrink: 0 }}>
              CHIẾN LƯỢC
            </span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: isDarkMode ? '#E2E8F0' : '#7C2D12', fontStyle: 'italic', flex: 1 }}>
              &ldquo;Săn đón tên miền rụng và mua tên miền đẹp giá gốc giúp Absolute Asia Travel dẫn đầu thị trường Inbound Luxury.&rdquo;
            </div>
          </div>

          {/* 5. QUICK SCAN & ADD TOOLBAR */}
          <form onSubmit={handleQuickCheck} className="quick-form" style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#18181B' : '#FFFFFF',
            padding: '12px',
            border: '2px solid #18181B',
            borderRadius: '10px',
            boxShadow: '2px 2px 0px #18181B'
          }}>
            <input
              type="text"
              placeholder="Nhập tên miền (vd: travelvietnam.com hoặc luxuryvietnam)..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '2px solid #18181B',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: isDarkMode ? '#27272A' : '#FBF9F5',
                color: isDarkMode ? '#FFFFFF' : '#18181B',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isScanning}
              className="brutal-btn brutal-btn-orange"
              style={{ opacity: isScanning ? 0.7 : 1, whiteSpace: 'nowrap' }}
            >
              {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
              {isScanning ? 'Đang quét...' : 'Quét RDAP Verisign'}
            </button>
          </form>

          {/* Live scan alert notification */}
          {scanMessage && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#EFF6FF',
              border: '2px solid #18181B',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              color: '#1E40AF',
              boxShadow: '2px 2px 0px #18181B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{scanMessage}</span>
              <button
                onClick={() => setScanMessage(null)}
                style={{ border: 'none', background: 'transparent', fontWeight: 800, cursor: 'pointer', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* 6. QUICK FILTER CHIPS (Horizontal Scrollable on Mobile) */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', whiteSpace: 'nowrap', marginRight: '4px' }}>
              LỌC:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`brutal-btn ${activeFilter === 'all' ? 'brutal-btn-orange' : 'brutal-btn-white'}`}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              Tất cả ({domains.length})
            </button>
            <button
              onClick={() => setActiveFilter('dropped_today')}
              className={`brutal-btn ${activeFilter === 'dropped_today' ? 'brutal-btn-orange' : 'brutal-btn-white'}`}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                backgroundColor: activeFilter === 'dropped_today' ? '#DC2626' : undefined,
                color: activeFilter === 'dropped_today' ? '#FFFFFF' : undefined,
                border: activeFilter === 'dropped_today' ? '2px solid #991B1B' : undefined
              }}
            >
              🚨 Bị xoá hôm nay ({totalDroppedToday})
            </button>
            <button
              onClick={() => setActiveFilter('p0')}
              className={`brutal-btn ${activeFilter === 'p0' ? 'brutal-btn-orange' : 'brutal-btn-white'}`}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              🔥 P0 ({totalP0})
            </button>
            <button
              onClick={() => setActiveFilter('vip')}
              className={`brutal-btn ${activeFilter === 'vip' ? 'brutal-btn-orange' : 'brutal-btn-white'}`}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              ⭐ VIP
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`brutal-btn ${activeFilter === 'pending' ? 'brutal-btn-orange' : 'brutal-btn-white'}`}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              ⌛ Sắp rụng ({totalPending})
            </button>
            <button
              onClick={() => setActiveFilter('available')}
              className={`brutal-btn ${activeFilter === 'available' ? 'brutal-btn-orange' : 'brutal-btn-white'}`}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              ✅ Mua ngay ({totalAvailable})
            </button>
          </div>

          {/* MOBILE COLUMN SELECTOR TABS */}
          <div className="mobile-only" style={{
            display: 'flex',
            backgroundColor: isDarkMode ? '#27272A' : '#EFEAE1',
            border: '2px solid #18181B',
            borderRadius: '8px',
            padding: '3px',
            overflowX: 'auto',
            gap: '4px'
          }}>
            <button
              onClick={() => setMobileTab('all')}
              style={{
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '11px',
                whiteSpace: 'nowrap',
                backgroundColor: mobileTab === 'all' ? '#18181B' : 'transparent',
                color: mobileTab === 'all' ? '#FFFFFF' : '#64748B'
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setMobileTab('active')}
              style={{
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '11px',
                whiteSpace: 'nowrap',
                backgroundColor: mobileTab === 'active' ? '#2563EB' : 'transparent',
                color: mobileTab === 'active' ? '#FFFFFF' : '#64748B'
              }}
            >
              Active ({activeList.length})
            </button>
            <button
              onClick={() => setMobileTab('pending')}
              style={{
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '11px',
                whiteSpace: 'nowrap',
                backgroundColor: mobileTab === 'pending' ? '#DC2626' : 'transparent',
                color: mobileTab === 'pending' ? '#FFFFFF' : '#64748B'
              }}
            >
              Sắp rụng ({pendingList.length})
            </button>
            <button
              onClick={() => setMobileTab('available')}
              style={{
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '11px',
                whiteSpace: 'nowrap',
                backgroundColor: mobileTab === 'available' ? '#059669' : 'transparent',
                color: mobileTab === 'available' ? '#FFFFFF' : '#64748B'
              }}
            >
              Mua ngay ({availableList.length})
            </button>
            <button
              onClick={() => setMobileTab('backlog')}
              style={{
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '11px',
                whiteSpace: 'nowrap',
                backgroundColor: mobileTab === 'backlog' ? '#1E293B' : 'transparent',
                color: mobileTab === 'backlog' ? '#FFFFFF' : '#64748B'
              }}
            >
              Chờ ({backlogList.length})
            </button>
          </div>

          {/* 7. FOUR-COLUMN KANBAN BOARD */}
          <div className="kanban-grid" style={{
            gap: '16px',
            alignItems: 'start'
          }}>
            
            {/* COLUMN 1: BACKLOG */}
            {(mobileTab === 'all' || mobileTab === 'backlog') && (
              <div style={{
                backgroundColor: isDarkMode ? '#18181B' : '#EFEAE1',
                border: '2px solid #18181B',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '3px 3px 0px #18181B'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="brutal-badge" style={{ backgroundColor: '#1E293B', color: '#FFFFFF' }}>
                      CHỜ QUÉT
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '13px' }}>BACKLOG</span>
                  </div>
                  <span className="brutal-badge" style={{ backgroundColor: '#FFFFFF', color: '#18181B' }}>
                    {backlogList.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {backlogList.map(item => (
                    <DomainCard key={item.id} item={item} onMove={moveDomain} onDelete={deleteDomain} isDarkMode={isDarkMode} />
                  ))}
                  {backlogList.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px 10px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                      Không có domain trong mục chờ quét
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COLUMN 2: ACTIVE MONITORING */}
            {(mobileTab === 'all' || mobileTab === 'active') && (
              <div style={{
                backgroundColor: isDarkMode ? '#18181B' : '#EFEAE1',
                border: '2px solid #18181B',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '3px 3px 0px #18181B'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="brutal-badge" style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
                      THEO DÕI
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '13px' }}>ACTIVE</span>
                  </div>
                  <span className="brutal-badge" style={{ backgroundColor: '#FFFFFF', color: '#18181B' }}>
                    {activeList.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeList.map(item => (
                    <DomainCard key={item.id} item={item} onMove={moveDomain} onDelete={deleteDomain} isDarkMode={isDarkMode} />
                  ))}
                </div>
              </div>
            )}

            {/* COLUMN 3: PENDING DELETE & GRACE */}
            {(mobileTab === 'all' || mobileTab === 'pending') && (
              <div style={{
                backgroundColor: isDarkMode ? '#18181B' : '#EFEAE1',
                border: '2px solid #18181B',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '3px 3px 0px #18181B'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="brutal-badge" style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}>
                      SẮP RỤNG
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '13px' }}>PENDING / GRACE</span>
                  </div>
                  <span className="brutal-badge" style={{ backgroundColor: '#FFFFFF', color: '#18181B' }}>
                    {pendingList.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingList.map(item => (
                    <DomainCard key={item.id} item={item} onMove={moveDomain} onDelete={deleteDomain} isDarkMode={isDarkMode} />
                  ))}
                </div>
              </div>
            )}

            {/* COLUMN 4: AVAILABLE TO BUY */}
            {(mobileTab === 'all' || mobileTab === 'available') && (
              <div style={{
                backgroundColor: isDarkMode ? '#18181B' : '#EFEAE1',
                border: '2px solid #18181B',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '3px 3px 0px #18181B'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="brutal-badge" style={{ backgroundColor: '#059669', color: '#FFFFFF' }}>
                      TRỐNG
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '13px' }}>AVAILABLE</span>
                  </div>
                  <span className="brutal-badge" style={{ backgroundColor: '#FFFFFF', color: '#18181B' }}>
                    {availableList.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {availableList.map(item => (
                    <DomainCard key={item.id} item={item} onMove={moveDomain} onDelete={deleteDomain} isDarkMode={isDarkMode} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 8. FLOATING ROBOT ACTION BUTTON (Tony AI Hunter) */}
      <button
        onClick={() => setScanMessage('Tony Agent đang chạy watchdog quét Verisign RDAP tự động mỗi 6 giờ.')}
        className="brutal-btn"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#F26522',
          color: '#FFFFFF',
          padding: 0,
          boxShadow: '3px 3px 0px #18181B',
          zIndex: 30
        }}
        title="Trợ lý Săn Tên Miền Tony"
      >
        <Bot size={24} />
      </button>

    </div>
  );
}

// ---------------- DOMAIN CARD COMPONENT ----------------
function DomainCard({
  item,
  onMove,
  onDelete,
  isDarkMode
}: {
  item: DomainItem;
  onMove: (id: string, status: DomainItem['status']) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}) {
  return (
    <div className="brutal-box" style={{
      padding: '12px',
      backgroundColor: isDarkMode ? '#27272A' : '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Top badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {item.priority === 'P0' ? (
            <span className="brutal-badge" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
              P0 KHẨN CẤP
            </span>
          ) : (
            <span className="brutal-badge" style={{ backgroundColor: '#E0E7FF', color: '#3730A3' }}>
              P1 TIÊU CHUẨN
            </span>
          )}
          {item.isVip && (
            <span className="brutal-badge" style={{ backgroundColor: '#F26522', color: '#FFFFFF' }}>
              ⭐ VIP
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
          {item.category}
        </span>
      </div>

      {/* Domain title */}
      <div>
        <div style={{ fontWeight: 800, fontSize: '15px', color: item.priority === 'P0' ? '#B91C1C' : undefined, wordBreak: 'break-all' }}>
          {item.domain}
        </div>
      </div>

      {/* Countdown / Status Box */}
      {item.daysLeft !== undefined && (
        <div style={{
          backgroundColor: item.daysLeft <= 15 ? '#FEE2E2' : '#F1F5F9',
          border: '1.5px solid #18181B',
          borderRadius: '6px',
          padding: '5px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: item.daysLeft <= 15 ? '#991B1B' : '#334155'
        }}>
          <span>
            {item.daysLeft > 0 ? `⏳ Còn ${item.daysLeft} ngày` : `⚠️ Quá hạn ${Math.abs(item.daysLeft)} ngày`}
          </span>
          <span style={{ fontSize: '10px', fontWeight: 600 }}>
            {item.expirationDate ? item.expirationDate.slice(0, 10) : ''}
          </span>
        </div>
      )}

      {/* Note / Description */}
      {item.note && (
        <div style={{ fontSize: '11px', color: isDarkMode ? '#D4D4D8' : '#475569', lineHeight: 1.4 }}>
          {item.note}
        </div>
      )}

      {/* Registrar & Estimated Value */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', fontWeight: 600, borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
        <span>{item.registrar || 'Chưa đăng ký'}</span>
        <span style={{ color: '#F26522', fontWeight: 700 }}>{item.priceEst || 'Thương lượng'}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
        {item.status === 'available' ? (
          <a
            href={`https://www.namecheap.com/domains/registration/results/?domain=${item.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn brutal-btn-orange"
            style={{ flex: 1, padding: '6px 8px', fontSize: '11px', textDecoration: 'none', minHeight: '32px' }}
          >
            Đăng ký ngay <ExternalLink size={11} />
          </a>
        ) : (
          <a
            href={`https://www.dynadot.com/domain/backorder?domain=${item.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn brutal-btn-white"
            style={{ flex: 1, padding: '6px 8px', fontSize: '11px', textDecoration: 'none', minHeight: '32px' }}
          >
            Đặt săn <ExternalLink size={11} />
          </a>
        )}

        <button
          onClick={() => {
            const nextMap: Record<DomainItem['status'], DomainItem['status']> = {
              backlog: 'active',
              active: 'pendingDelete',
              grace: 'pendingDelete',
              pendingDelete: 'available',
              available: 'active'
            };
            onMove(item.id, nextMap[item.status]);
          }}
          className="brutal-btn brutal-btn-white"
          style={{ padding: '6px 8px', fontSize: '11px', minHeight: '32px' }}
          title="Đổi cột"
        >
          Dời cột
        </button>
      </div>
    </div>
  );
}
