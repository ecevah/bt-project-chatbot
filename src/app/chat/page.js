"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_KEY = "";
const API_URL = "http://localhost:3001";

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [allData, setAllData] = useState({
    users: [],
    workers: [],
    works: [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  // Tüm verileri yükle
  const fetchAllData = async () => {
    try {
      const [usersRes, workersRes, worksRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/workers`),
        fetch(`${API_URL}/works`),
      ]);

      const [users, workers, works] = await Promise.all([
        usersRes.json(),
        workersRes.json(),
        worksRes.json(),
      ]);

      setAllData({ users, workers, works });
    } catch (err) {
      setError("Veri yüklenirken hata oluştu");
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    fetchAllData();
  }, []);

  const createSystemPrompt = () => {
    const { users, workers, works } = allData;
    return `
  Sen BT Ajans'ın AI destekli iş eşleştirme ve proje yönetimi asistanısın. Kullanıcılara en iyi hizmeti sunmak için akıllı öneriler yapmalısın.
  
  === ŞIRKET BILGILERI ===
  BT Ajans: 2022 yılında İstanbul'da, Bakırçay Üniversitesi Bilgisayar Mühendisliği mezunu ve yapay zekâ ile dijital pazarlama alanında 5 yılı aşkın deneyime sahip Ali Tunçyüzlü tarafından kurulmuştur.
  
  **Misyonumuz:** İşletmelerin dijital dönüşüm süreçlerini yapay zekâ ve otomasyon teknolojileriyle hızlandırarak veri odaklı, yaratıcı ve ölçülebilir çözümler sunmak.
  
  **Vizyonumuz:** 2025 yılına kadar Türkiye ve bölgedeki en yenilikçi, yapay zekâ destekli dijital ajans olarak anılmak ve BTFlow AI platformumuzu küresel ölçekte yaygınlaştırmaktır.
  
  **Değerlerimiz:** Yenilikçilik, müşteri odaklılık, kalite, işbirliği ve sürdürülebilirlik.
  
  **Hizmetlerimiz:**
  - Google Ads, Trendyol ve Hepsiburada reklam yönetimi
  - SEO iyileştirmeleri
  - AI destekli chatbot ve otomasyon çözümleri
  - BTFlow AI entegrasyonları (freelancer teklif analiz ve eşleştirme, otomatik raporlama)
  - Sosyal medya ve içerik pazarlaması
  - Node.js/FastAPI backend ile React (Next.js) frontend geliştirme
  - UX/UI tasarım
  - SEO/SEM danışmanlığı ve teknik dokümantasyon
  
  **Uzman Ekibimiz (20'ye yakın freelancer):**
  AI proje yöneticisi, veri bilimci, NLP mühendisi, makine öğrenimi mühendisi, prompt mühendisi, full-stack ve frontend/backend geliştirici, UI/UX tasarımcısı, DevOps mühendisi, QA mühendisi, iş analisti, pazarlama ve SEO uzmanı, içerik stratejisti, sosyal medya yöneticisi, müşteri başarı yöneticisi, grafik tasarımcı ve performans analisti.

  === VERİ TABANI ===
  User Data:
  ${JSON.stringify(users, null, 2)}
  
  Worker Data:
  ${JSON.stringify(workers, null, 2)}
  
  Work Data:
  ${JSON.stringify(works, null, 2)}
  
  === GÖREV TANIMLARIN ===
  
  1. **MEVCUT İŞ ANALİZİ:**
     - Kullanıcının bahsettiği konu mevcut works tablosundaki herhangi bir işle eşleşiyor mu?
     - Eşleşiyorsa: O iş hakkında detaylı bilgi ver, ilerleme durumu, öneriler sunabilirsin
     - Customer veya freelancer perspektifinden uygun tavsiyelerde bulun
  
  2. **YENİ İŞ DEĞERLENDİRMESİ:**
     - Eğer yeni bir iş talebi varsa, workers tablosundan en uygun kişileri analiz et
     - Skill eşleşmesi, experience seviyesi, availability durumunu değerlendir
     - Her worker için neden uygun olduğunu detaylı açıkla
     - Fiyat tahmini, timeline önerisi, risk analizi yap
     - En az 2-3 alternatif worker öner
  
  3. **İŞ FİKRİ GELİŞTİRME:**
     - Kullanıcı henüz net bir iş tanımı yapmadıysa, fikrini geliştirmesine yardım et
     - Soru sorarak gereksinimleri netleştir
     - Benzer projeler hakkında bilgi ver
     - Bu durumda worker önerme, önce fikri olgunlaştır
  
  4. **AKILLI ÖNERİLER:**
     - Budget analizi (piyasa fiyatları, makul bütçe önerileri)
     - Timeline önerileri (gerçekçi deadline'lar)
     - Risk değerlendirmesi (proje karmaşıklığı, gereksinimler)
     - Alternatif çözüm yolları
     - Proje başarı faktörleri
  
  5. **ŞİRKET BİLGİ DESTEĞİ:**
     - BT Ajans hakkında sorular sorulduğunda yukarıdaki şirket bilgilerini kullan
     - Hizmetlerimiz ve uzman ekibimiz hakkında detaylı bilgi ver
     - BTFlow AI platformu hakkında bilgi isterlerse yapay zeka destekli freelancer eşleştirme ve proje yönetimi platformu olduğunu belirt
  
  === CEVAP FORMATI ===
  MUTLAKA bu JSON formatında cevap ver:
  
  {
    "message": "Kullanıcıya verilecek detaylı ve yardımcı mesaj (markdown formatında yazabilirsin)",
    "create_work": {
      "customer_id": "customer'ın user_id'si (kim iş veren)",
      "description": "detaylı proje açıklaması",
      "budget": "önerilen budget (sayısal)",
      "deadline_time": "YYYY-MM-DD formatında tarih",
      "status": "Beklemede",
      "freelancer_id": "önerilen worker'ın user_id'si"
    } // İş oluşturulmayacaksa null,
    "work": "mevcut işle ilgili konuşuluyorsa o iş objesi" // yoksa null,
    "recommendations": {
      "alternative_workers": ["alternatif worker id'leri"],
      "budget_range": {"min": 0, "max": 0},
      "timeline_suggestion": "timeline önerisi",
      "risk_level": "düşük/orta/yüksek",
      "success_tips": ["başarı için öneriler"]
    } // her zaman doldur
  }
  
  === ÖNEMLİ KURALLAR ===
  
  1. **DOĞRU İŞ ATAMALARI:**
     - create_work.customer_id: İşi VEREN kişinin id'si (müşteri)
     - create_work.freelancer_id: İşi YAPACAK kişinin id'si (worker)
     - Bu ikisini karıştırma!
  
  2. **KULLANICI PROFİL ANALİZİ:**
     - Şu anki kullanıcı: ${user?.username} (ID: ${user?.id}, Role: ${
      user?.role
    })
     - Kullanıcının role'üne göre yaklaşımını ayarla
     - Admin: Genel yönetim önerileri
     - Customer: İş verme odaklı öneriler  
     - Freelancer: İş alma odaklı öneriler
  
  3. **İLETİŞİM STİLİ:**
     - Profesyonel ama samimi
     - Somut örnekler ver
     - Sayısal verilerle destekle
     - Alternatifleri her zaman sun
     - Kullanıcıyı yönlendirici sorular sor
     - Markdown formatını kullan (başlıklar, listeler, vurgular)
  
  4. **KARAR VERME KRİTERLERİ:**
     - İş oluşturma: Kullanıcı net bir talep belirtirse ve uygun worker varsa
     - Mevcut iş referansı: Konuşma mevcut bir işle ilgiliyse
     - Tavsiye modu: Kullanıcı keşif aşamasındaysa
  
  UNUTMA: Her cevabında kullanıcıya değer kat, onun hedeflerine ulaşmasına yardım et!
  `;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: createSystemPrompt(),
            },
            ...newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("OpenAI API hatası");
      }

      const data = await res.json();
      const botMessage = data.choices[0].message.content;

      // JSON parse botMessage
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(botMessage);
      } catch (err) {
        parsedMessage = {
          message: botMessage,
          create_work: null,
          work: null,
          recommendations: null,
        };
      }

      // Eğer yeni iş oluşturulacaksa - Düzeltildi
      if (parsedMessage.create_work && parsedMessage.create_work.description) {
        try {
          const workRes = await fetch(`${API_URL}/works`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(parsedMessage.create_work),
          });

          if (workRes.ok) {
            await fetchAllData(); // Verileri güncelle
            console.log("Yeni iş oluşturuldu:", parsedMessage.create_work);
          }
        } catch (err) {
          console.error("İş oluşturma hatası:", err);
        }
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: parsedMessage.message,
          metadata: {
            create_work: parsedMessage.create_work,
            work: parsedMessage.work,
            recommendations: parsedMessage.recommendations,
          },
        },
      ]);
    } catch (err) {
      setError("API hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return "👨‍💼";
      case "Customer":
        return "👤";
      case "Freelancer":
        return "💼";
      default:
        return "👤";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Beklemede":
        return "bg-yellow-100 text-yellow-800";
      case "Devam Ediyor":
        return "bg-blue-100 text-blue-800";
      case "Tamamlandı":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-16"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {sidebarOpen && <h2 className="font-bold text-lg">BT Ajans</h2>}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              {getRoleIcon(user.role)}
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-semibold">{user.username}</div>
                <div className="text-sm text-gray-600">{user.role}</div>
              </div>
            )}
          </div>
        </div>

        {/* Data Overview */}
        {sidebarOpen && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">
                    Toplam Kullanıcı
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    {allData.users.length}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">
                    Çalışanlar
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {allData.workers.length}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">
                    Aktif İşler
                  </div>
                  <div className="text-xl font-bold text-purple-900">
                    {allData.works.length}
                  </div>
                </div>
              </div>

              {/* Recent Works */}
              <div>
                <h3 className="font-semibold mb-2">Son İşler</h3>
                <div className="space-y-2">
                  {allData.works.slice(0, 3).map((work) => (
                    <div key={work.id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium truncate">
                        {work.description}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            work.status
                          )}`}
                        >
                          {work.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          ₺{work.budget}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Panel Link */}
              {user.role === "Admin" && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full bg-purple-100 text-purple-800 p-3 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                  >
                    📊 Admin Panel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Icons when collapsed */}
        {!sidebarOpen && (
          <div className="flex-1 p-2 space-y-2">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span className="text-blue-600 font-bold text-xs">
                  {allData.users.length}
                </span>
              </div>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span className="text-green-600 font-bold text-xs">
                  {allData.workers.length}
                </span>
              </div>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span className="text-purple-600 font-bold text-xs">
                  {allData.works.length}
                </span>
              </div>
            </div>
            {user.role === "Admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto hover:bg-purple-200 transition-colors"
                title="Admin Panel"
              >
                <span className="text-purple-600">📊</span>
              </button>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`${
              sidebarOpen ? "w-full" : "w-8 h-8 mx-auto"
            } bg-red-500 text-white rounded-lg py-2 px-3 hover:bg-red-600 transition-colors flex items-center justify-center`}
            title={!sidebarOpen ? "Çıkış" : ""}
          >
            {sidebarOpen ? (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Çıkış
              </>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                BT Ajans AI Asistan
              </h1>
              <p className="text-sm text-gray-600">
                İş tekliflerinizi ve projelerinizi yönetin
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Merhaba {user.username}!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                BT Ajans AI asistanınızla konuşmaya başlayın. İş fikirleri,
                proje önerileri ve freelancer eşleştirmeleri için yardım
                alabilirsiniz.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl ${
                  msg.role === "user" ? "bg-blue-500 text-white" : "bg-white"
                } rounded-2xl p-4 shadow-lg`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-blue-600"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <span className="text-white text-sm font-bold">
                        {user.username[0].toUpperCase()}
                      </span>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium mb-1 ${
                        msg.role === "user" ? "text-blue-100" : "text-gray-700"
                      }`}
                    >
                      {msg.role === "user" ? user.username : "BT Ajans AI"}
                    </div>
                    <div
                      className={`${
                        msg.role === "user" ? "text-white" : "text-gray-900"
                      } prose prose-sm max-w-none`}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata Cards */}
                {msg.metadata && (
                  <div className="mt-4 space-y-3">
                    {/* Work Reference */}
                    {msg.metadata.work && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <svg
                            className="w-4 h-4 text-blue-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="font-medium text-blue-900">
                            İlgili İş
                          </span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <div>
                            <strong>Açıklama:</strong>{" "}
                            {msg.metadata.work.description}
                          </div>
                          <div>
                            <strong>Bütçe:</strong> ₺{msg.metadata.work.budget}
                          </div>
                          <div>
                            <strong>Durum:</strong>{" "}
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                msg.metadata.work.status
                              )}`}
                            >
                              {msg.metadata.work.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* New Work Created */}
                    {msg.metadata.create_work &&
                      msg.metadata.create_work.description && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <svg
                              className="w-4 h-4 text-green-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <span className="font-medium text-green-900">
                              ✅ Yeni İş Oluşturuldu
                            </span>
                          </div>
                          <div className="text-sm text-green-800">
                            <div>
                              <strong>Açıklama:</strong>{" "}
                              {msg.metadata.create_work.description}
                            </div>
                            <div>
                              <strong>Bütçe:</strong> ₺
                              {msg.metadata.create_work.budget}
                            </div>
                            <div>
                              <strong>Deadline:</strong>{" "}
                              {msg.metadata.create_work.deadline_time}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Recommendations */}
                    {msg.metadata.recommendations && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <svg
                            className="w-4 h-4 text-purple-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          <span className="font-medium text-purple-900">
                            💡 Öneriler
                          </span>
                        </div>
                        <div className="text-sm text-purple-800 space-y-1">
                          {msg.metadata.recommendations.budget_range && (
                            <div>
                              <strong>Bütçe Aralığı:</strong> ₺
                              {msg.metadata.recommendations.budget_range.min} -
                              ₺{msg.metadata.recommendations.budget_range.max}
                            </div>
                          )}
                          {msg.metadata.recommendations.timeline_suggestion && (
                            <div>
                              <strong>Zaman Tahmini:</strong>{" "}
                              {msg.metadata.recommendations.timeline_suggestion}
                            </div>
                          )}
                          {msg.metadata.recommendations.risk_level && (
                            <div>
                              <strong>Risk Seviyesi:</strong>{" "}
                              {msg.metadata.recommendations.risk_level}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow-lg max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSend} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="İş fikirinizi veya sorularınızı yazın..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
