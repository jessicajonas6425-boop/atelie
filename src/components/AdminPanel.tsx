import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order, Product } from '../types';
import { Button, cn } from './ui/Button';
import { Search, Package, CheckCircle2, Clock, XCircle, LogOut, ChevronRight, User, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setError(null);
    const ordersPath = 'orders';
    const qOrders = query(collection(db, ordersPath), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Orders sync error:", err);
      setError("Erro ao carregar dados. Verifique suas permissões.");
      handleFirestoreError(err, OperationType.GET, ordersPath);
    });

    const productsPath = 'products';
    const qProducts = query(collection(db, productsPath));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    }, (err) => {
      console.error("Products sync error:", err);
      handleFirestoreError(err, OperationType.GET, productsPath);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const CATEGORIES = ['Garrafa', 'Garrafa (PERSONALIZAR)', 'Caneca', 'Azulejo', 'Caneleira', 'Camiseta'];

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        const { updateDoc, doc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'products', editingProduct.id), editingProduct);
      } else {
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'products'), { ...editingProduct, isActive: true });
      }
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    const docPath = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500" />;
      case 'processing': return <Package className="text-blue-500" />;
      case 'cancelled': return <XCircle className="text-red-500" />;
      default: return <Clock className="text-yellow-500" />;
    }
  };

  if (error) return (
    <div className="p-20 text-center font-sans">
      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6 stroke-[1.5px]" />
      <p className="text-3xl font-serif italic text-white mb-10">{error}</p>
      <div className="flex justify-center gap-6">
        <Button onClick={() => window.location.reload()}>Recarregar Painel</Button>
        <Button variant="outline" onClick={() => auth.signOut()}>Finalizar Sessão</Button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-32 text-center font-sans bg-[#FCFAF7] min-h-screen">
      <div className="w-24 h-1 bg-slate-900/5 mx-auto mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#E30613] animate-slide-loading"></div>
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-black italic">Sincronizando Banco de Dados . Ateliê VLM</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-12 py-32 font-sans bg-[#FCFAF7]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-16">
        <div>
          <div className="vlm-label mb-6">Gestão Ateliê VLM</div>
          <h1 className="text-8xl font-serif italic font-black tracking-tighter text-black leading-none">Portal.<br/><span className="text-[#E30613] text-[0.8em] font-black uppercase not-italic">Controle</span></h1>
          <div className="flex gap-16 mt-16 border-b border-slate-900/5">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.4em] pb-6 border-b-4 transition-all duration-700 -mb-px",
                activeTab === 'orders' ? "border-[#E30613] text-black" : "border-transparent text-slate-300 hover:text-black"
              )}
            >
              Orçamentos
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.4em] pb-6 border-b-4 transition-all duration-700 -mb-px",
                activeTab === 'products' ? "border-[#E30613] text-black" : "border-transparent text-slate-300 hover:text-black"
              )}
            >
              Acervo de Peças
            </button>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {activeTab === 'products' && (
            <Button 
              onClick={() => { setEditingProduct({}); setShowProductModal(true); }}
              id="add-product-btn"
              className="px-12 bg-slate-900 text-white"
            >
              NOVO ITEM
            </Button>
          )}
          <Button variant="ghost" onClick={() => auth.signOut()} className="px-10 text-gray-400 hover:text-black" id="admin-logout-btn">
            SAIR.
          </Button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-12 xl:col-span-8">
            <div className="bg-white border border-slate-900/5 shadow-2xl relative overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF9F7] border-b border-slate-900/5 text-slate-400">
                    <tr>
                      <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Referência</th>
                      <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Cliente</th>
                      <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Valor</th>
                      <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Status</th>
                      <th className="px-10 py-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className={cn("hover:bg-slate-50 transition-colors cursor-pointer group", selectedOrder?.id === order.id && "bg-red-50/50")}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-10 py-14">
                          <span className="text-[12px] font-mono font-black text-[#E30613]">#{order.id?.slice(-8).toUpperCase()}</span>
                          <div className="text-[9px] text-slate-300 font-black tracking-[0.3em] mt-3 uppercase italic">
                            {new Date(order.createdAt?.seconds * 1000).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-10 py-14">
                          <div className="text-4xl font-serif italic text-black font-black">{order.customerName}</div>
                          <div className="text-[11px] font-black text-gray-500 tracking-[0.4em] mt-3 uppercase flex flex-col gap-1">
                            <span>WA: {order.customerWhatsapp}</span>
                            {order.cep && <span>CEP: {order.cep}</span>}
                          </div>
                        </td>
                        <td className="px-10 py-14 text-2xl font-serif font-black text-black italic">
                          <div className="flex flex-col">
                            <span>R$ {order.total.toFixed(2)}</span>
                            {order.paymentMethod && (
                              <span className="text-[9px] uppercase tracking-widest text-red-600 font-black">{order.paymentMethod}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-14">
                          <div className={cn(
                            "px-6 py-2 text-[9px] font-black uppercase tracking-[0.4em] inline-flex items-center gap-4 rounded-full border",
                            order.status === 'completed' ? "bg-green-500/10 border-green-500/30 text-green-600" : 
                            order.status === 'processing' ? "bg-blue-500/10 border-blue-500/30 text-blue-600" :
                            order.status === 'cancelled' ? "bg-red-500/10 border-red-500/30 text-red-600" :
                            "bg-red-500/10 border-red-500/30 text-red-600"
                          )}>
                             {order.status}
                          </div>
                        </td>
                        <td className="px-10 py-14 text-right">
                          <ChevronRight className="w-8 h-8 text-slate-100 group-hover:text-red-500 transition-all transform group-hover:translate-x-3 inline" strokeWidth={3} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 relative">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div 
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="bg-white border border-slate-900/10 p-16 shadow-[0px_100px_200px_rgba(0,0,0,0.1)] sticky top-40 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#E30613]"></div>
                  <div className="flex justify-between items-start mb-16">
                    <h2 className="text-5xl font-serif italic text-black font-black">Dossiê.</h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-200 hover:text-red-500 transition-colors">Fechar ×</button>
                  </div>

                  <div className="space-y-16">
                    <div className="bg-slate-50 p-12 border border-slate-900/5 relative">
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] mb-6">Sujeito da Cotação</p>
                      <p className="text-4xl font-serif italic mb-3 text-black font-black">{selectedOrder.customerName}</p>
                      <p className="text-[12px] font-mono text-red-600 font-bold tracking-[0.2em]">{selectedOrder.customerWhatsapp}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] mb-10">Conteúdo do Acervo</p>
                      <div className="space-y-8">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col border-b border-slate-900/5 pb-8">
                            <div className="flex justify-between text-base items-baseline">
                              <span className="text-gray-500 uppercase font-black tracking-[0.2em] text-[11px] italic">{item.quantity}un &times; {item.name}</span>
                              <span className="font-serif font-black text-black text-xl italic">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            {item.personalizationName && (
                              <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mt-2">NOME: {item.personalizationName}</p>
                            )}
                            {item.complementDescription && (
                              <p className="text-[10px] font-black uppercase text-black tracking-widest mt-1">DETALHE: {item.complementDescription}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                      <div className="pt-10 mb-20 border-t border-slate-900/5 grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">Método de Pagamento</p>
                          <p className="text-xl font-serif font-black italic uppercase text-red-600">{selectedOrder.paymentMethod || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">Frete (Calculado)</p>
                          <p className="text-xl font-serif font-black italic text-black">R$ {selectedOrder.shippingCost?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>

                      <div className="pt-20 border-t border-slate-900/10">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-12 text-center">Protocolo de Operação</p>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                          <Button 
                            variant={selectedOrder.status === 'processing' ? 'primary' : 'outline'} 
                            size="md" 
                            className={cn("h-24 text-base font-black uppercase tracking-widest", selectedOrder.status === 'processing' ? 'bg-[#E30613]' : 'border-slate-900/10 text-black')}
                            onClick={() => updateStatus(selectedOrder.id!, 'processing')}
                          >
                            EM ANÁLISE
                          </Button>
                          <Button 
                            variant={selectedOrder.status === 'completed' ? 'primary' : 'outline'} 
                            size="md" 
                            className={cn("h-24 text-base font-black uppercase tracking-widest", selectedOrder.status === 'completed' ? 'bg-green-600' : 'border-slate-900/10 text-black')}
                            onClick={() => updateStatus(selectedOrder.id!, 'completed')}
                          >
                            FINALIZAR
                          </Button>
                        </div>
                        <Button 
                          variant="danger" 
                          size="md" 
                          className="w-full h-24 border border-red-500/20 text-red-600 font-black uppercase tracking-widest hover:bg-red-50"
                          onClick={() => updateStatus(selectedOrder.id!, 'cancelled')}
                        >
                          ANULAR PEDIDO
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[800px] flex flex-col items-center justify-center p-20 text-center border border-dashed border-slate-900/10 bg-slate-50/50">
                   <div className="p-10 bg-slate-100 rounded-full mb-12 border border-slate-900/5">
                    <Search className="w-16 h-16 text-slate-300 stroke-[1px]" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-black italic leading-relaxed">Aguardando Seleção de<br/>Manifesto para Análise.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-900/5 shadow-2xl relative overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF9F7] border-b border-slate-900/5 text-slate-400">
                <tr>
                  <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Vista Prévia</th>
                  <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Nome do Objeto</th>
                  <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Domínio</th>
                  <th className="px-10 py-10 text-[9px] font-black uppercase tracking-[0.5em]">Valor de Mercado</th>
                  <th className="px-10 py-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-10">
                      <div className="w-24 h-32 bg-[#F2F1EE] border border-slate-900/5 overflow-hidden group relative">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="text-3xl font-serif italic text-black font-black">{product.name}</div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="vlm-label !mb-0 !py-2 !px-4 text-[9px] uppercase tracking-[0.4em] font-black">{product.category}</div>
                    </td>
                    <td className="px-10 py-10 font-serif font-black text-xl italic text-black">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="px-10 py-10 text-right flex items-center justify-end h-52 gap-8">
                      <Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setShowProductModal(true); }} className="border-slate-900/10 text-black">EDITAR</Button>
                      <Button variant="danger" size="sm" onClick={() => deleteProduct(product.id)} className="bg-red-500 text-white">REMOVER</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/80 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 100 }}
              className="bg-white p-20 max-w-4xl w-full border border-slate-900/10 shadow-[0px_100px_200px_rgba(0,0,0,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
              <h2 className="text-7xl font-serif italic font-black mb-20 text-black tracking-tighter">Item de Acervo.</h2>
              <form onSubmit={handleProductSubmit} className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-12">
                    <div>
                      <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-4">Título da Peça</label>
                      <input 
                        type="text" 
                        required 
                        className="vlm-input w-full text-3xl font-serif italic font-black"
                        value={editingProduct?.name || ''}
                        onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-12">
                      <div>
                        <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-4">Valor Base (BRL)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          required 
                          className="vlm-input w-full font-serif font-black text-2xl text-red-600"
                          value={editingProduct?.price || ''}
                          onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-4">Domínio</label>
                        <select 
                          className="vlm-input w-full text-[11px] font-black uppercase tracking-[0.3em] pt-5"
                          value={editingProduct?.category || ''}
                          onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                          required
                        >
                          <option value="">SELECIONAR</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-4">Fonte de Mídia (URL)</label>
                      <input 
                        type="url" 
                        required 
                        className="vlm-input w-full text-xs font-mono text-slate-400"
                        value={editingProduct?.imageUrl || ''}
                        onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-6 border border-slate-900/5">
                      <input 
                        type="checkbox"
                        id="has-complements-check"
                        className="w-6 h-6 border-slate-200 text-red-600 focus:ring-red-500"
                        checked={editingProduct?.hasComplements || false}
                        onChange={e => setEditingProduct({...editingProduct, hasComplements: e.target.checked})}
                      />
                      <label htmlFor="has-complements-check" className="text-[10px] font-black uppercase tracking-[0.2em] text-black cursor-pointer">Permitir Complementos (+R$ 15,00)</label>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-4">Manifesto Técnico</label>
                    <textarea 
                      className="vlm-input w-full flex-1 min-h-[300px] text-base leading-relaxed text-gray-700 resize-none font-sans italic"
                      value={editingProduct?.description || ''}
                      onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                      placeholder="DESCREVA A ESSÊNCIA DO ITEM..."
                    />
                  </div>
                </div>
                <div className="flex gap-8 pt-20">
                  <Button type="submit" className="flex-1 h-24 text-xl bg-orange-500 font-black">REGISTRAR NO ACERVO</Button>
                  <Button variant="ghost" onClick={() => setShowProductModal(false)} className="flex-1 text-slate-300 hover:text-black uppercase font-black tracking-widest">ABORTAR</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

