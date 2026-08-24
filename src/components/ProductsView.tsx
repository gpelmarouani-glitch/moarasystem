import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Percent,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatMAD } from '../utils/calculations';

export const ProductsView: React.FC = () => {
  const { products, orders, addProduct, updateProduct, deleteProduct, t } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('منتجات بارافارماسي');
  const [price, setPrice] = useState<number>(100);
  const [cost, setCost] = useState<number>(50);
  const [stock, setStock] = useState<number>(50);
  const [description, setDescription] = useState('');

  // Calculate sold quantities from orders
  const productStats = products.map((prod) => {
    let soldQty = 0;
    let deliveredQty = 0;
    orders.forEach((o) => {
      if (o.productSku === prod.sku || o.productName === prod.name) {
        soldQty += o.quantity;
        if (o.deliveryStatus === 'تم التوصيل') {
          deliveredQty += o.quantity;
        }
      }
    });

    const marginMAD = prod.price - prod.cost;
    const marginPercent = prod.price > 0 ? Math.round((marginMAD / prod.price) * 100) : 0;

    return {
      ...prod,
      soldQty,
      deliveredQty,
      marginMAD,
      marginPercent,
    };
  });

  const filteredProducts = productStats.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProd(null);
    setName('');
    setSku(`MP-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('منتجات بارافارماسي');
    setPrice(150);
    setCost(80);
    setStock(100);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProd(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      price: Number(price) || 0,
      cost: Number(cost) || 0,
      stock: Number(stock) || 0,
      description: description.trim(),
    };

    if (editingProd) {
      updateProduct(editingProd.id, payload);
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>كتالوج المنتجات والمخزون (Product Catalog & Inventory)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة تسعيرة المنتجات، تكلفة الشراء، هوامش الربح، والكميات المتوفرة في المخزن
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-extrabold text-slate-800">قائمة المنتجات ({filteredProducts.length})</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في المنتجات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg ps-8 pe-3 py-1.5 text-xs text-slate-800 w-52"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">المنتج</th>
                <th className="p-3 text-start">SKU</th>
                <th className="p-3 text-start">التصنيف</th>
                <th className="p-3 text-start">ثمن البيع</th>
                <th className="p-3 text-start">تكلفة الشراء</th>
                <th className="p-3 text-start text-emerald-800">هامش الربح</th>
                <th className="p-3 text-center">المخزون المتوفر</th>
                <th className="p-3 text-center">المسلم للعملاء</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{prod.name}</td>
                  <td className="p-3 font-mono text-slate-500">{prod.sku}</td>
                  <td className="p-3 text-slate-600">{prod.category}</td>
                  <td className="p-3 font-black text-emerald-800">{formatMAD(prod.price)}</td>
                  <td className="p-3 font-semibold text-slate-600">{formatMAD(prod.cost)}</td>
                  <td className="p-3 font-bold text-emerald-700">
                    {formatMAD(prod.marginMAD)}{' '}
                    <span className="text-[10px] text-emerald-600 font-normal">({prod.marginPercent}%)</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        prod.stock <= 10
                          ? 'bg-rose-100 text-rose-800'
                          : prod.stock <= 30
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {prod.stock} قطعة
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-indigo-700">{prod.deliveredQty} قطعة</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEdit(prod)}
                        className="p-1 text-slate-500 hover:text-blue-700 rounded"
                        title="تعديل المنتج"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(prod.id)}
                        className="p-1 text-slate-500 hover:text-rose-700 rounded"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 mb-4">
              {editingProd ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">رمز المنتج (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ثمن البيع (MAD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-emerald-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">تكلفة الشراء (MAD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">الكمية المتوفرة في المخزن</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  {editingProd ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
