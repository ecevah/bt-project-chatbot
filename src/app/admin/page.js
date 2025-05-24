"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:3001";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState({
    users: [],
    workers: [],
    works: [],
  });
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "Admin") {
      router.push("/chat");
      return;
    }
    setUser(parsedUser);
    fetchAllData();
  }, []);

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

      setData({ users, workers, works });
    } catch (err) {
      alert("Veri yüklenirken hata oluştu");
    }
  };

  const handleCreate = () => {
    const emptyItem = getEmptyItem(activeTab);
    setEditItem(emptyItem);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${activeTab}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAllData();
        alert("Öğe başarıyla silindi");
      }
    } catch (err) {
      alert("Silme işlemi sırasında hata oluştu");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const isUpdate = editItem.id;
      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate
        ? `${API_URL}/${activeTab}/${editItem.id}`
        : `${API_URL}/${activeTab}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editItem),
      });

      if (res.ok) {
        await fetchAllData();
        setShowModal(false);
        setEditItem(null);
        alert(isUpdate ? "Güncelleme başarılı" : "Ekleme başarılı");
      }
    } catch (err) {
      alert("İşlem sırasında hata oluştu");
    }
    setLoading(false);
  };

  const getEmptyItem = (tab) => {
    switch (tab) {
      case "users":
        return { username: "", password: "", role: "Customer" };
      case "workers":
        return { name: "", skill: "", experience: 0, availability: true };
      case "works":
        return {
          customer_id: "",
          description: "",
          budget: 0,
          deadline_time: "",
          status: "Beklemede",
          freelancer_id: "",
        };
      default:
        return {};
    }
  };

  const getColumns = (tab) => {
    switch (tab) {
      case "users":
        return [
          { key: "id", label: "ID" },
          { key: "username", label: "Kullanıcı Adı" },
          { key: "password", label: "Şifre" },
          { key: "role", label: "Rol" },
        ];
      case "workers":
        return [
          { key: "id", label: "ID" },
          { key: "name", label: "İsim" },
          { key: "skill", label: "Yetenek" },
          { key: "experience", label: "Deneyim" },
          { key: "availability", label: "Uygunluk" },
        ];
      case "works":
        return [
          { key: "id", label: "ID" },
          { key: "customer_id", label: "Müşteri ID" },
          { key: "description", label: "Açıklama" },
          { key: "budget", label: "Bütçe" },
          { key: "deadline_time", label: "Deadline" },
          { key: "status", label: "Durum" },
          { key: "freelancer_id", label: "Freelancer ID" },
        ];
      default:
        return [];
    }
  };

  const renderFormField = (column) => {
    const value = editItem?.[column.key] || "";

    switch (column.key) {
      case "role":
        return (
          <select
            value={value}
            onChange={(e) =>
              setEditItem({ ...editItem, [column.key]: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          >
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
            <option value="Freelancer">Freelancer</option>
          </select>
        );
      case "status":
        return (
          <select
            value={value}
            onChange={(e) =>
              setEditItem({ ...editItem, [column.key]: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          >
            <option value="Beklemede">Beklemede</option>
            <option value="Devam Ediyor">Devam Ediyor</option>
            <option value="Tamamlandı">Tamamlandı</option>
          </select>
        );
      case "availability":
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) =>
              setEditItem({ ...editItem, [column.key]: e.target.checked })
            }
            className="w-5 h-5"
          />
        );
      case "experience":
      case "budget":
      case "customer_id":
      case "freelancer_id":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) =>
              setEditItem({
                ...editItem,
                [column.key]: parseInt(e.target.value) || 0,
              })
            }
            className="w-full p-2 border rounded-lg"
          />
        );
      case "deadline_time":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) =>
              setEditItem({ ...editItem, [column.key]: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
        );
      case "password":
        return (
          <input
            type="password"
            value={value}
            onChange={(e) =>
              setEditItem({ ...editItem, [column.key]: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setEditItem({ ...editItem, [column.key]: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
        );
    }
  };

  const renderCellValue = (item, column) => {
    const value = item[column.key];

    switch (column.key) {
      case "availability":
        return value ? "✅ Uygun" : "❌ Uygun Değil";
      case "budget":
        return `₺${value}`;
      case "password":
        return "••••••••";
      default:
        return value;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              BT Ajans Admin Panel
            </h1>
            <p className="text-gray-600">Veritabanı yönetimi</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Hoşgeldin, {user.username}
            </span>
            <button
              onClick={() => router.push("/chat")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Chat'e Dön
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                router.push("/");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                {
                  key: "users",
                  label: "Kullanıcılar",
                  count: data.users.length,
                },
                {
                  key: "workers",
                  label: "Çalışanlar",
                  count: data.workers.length,
                },
                { key: "works", label: "İşler", count: data.works.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === "users"
                ? "Kullanıcılar"
                : activeTab === "workers"
                ? "Çalışanlar"
                : "İşler"}
            </h2>
            <button
              onClick={handleCreate}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
              disabled={loading}
            >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Yeni Ekle
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {getColumns(activeTab).map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data[activeTab].map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {getColumns(activeTab).map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {renderCellValue(item, column)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        disabled={loading}
                      >
                        ✏️ Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        disabled={loading}
                      >
                        🗑️ Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editItem?.id ? "Düzenle" : "Yeni Ekle"}
              </h3>

              <div className="space-y-4">
                {getColumns(activeTab)
                  .filter((col) => col.key !== "id")
                  .map((column) => (
                    <div key={column.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {column.label}
                      </label>
                      {renderFormField(column)}
                    </div>
                  ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditItem(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={loading}
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
