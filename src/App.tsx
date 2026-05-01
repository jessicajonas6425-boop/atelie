import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  onSnapshot
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { Product, Order, OrderItem, Settings } from './types';
import { ProductCard } from './components/ProductCard';
import { SimplePersonalizer } from './components/SimplePersonalizer';
import { AdminPanel } from './components/AdminPanel';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AIAssistant } from './components/AIAssistant';
import { Button, Input, cn } from './components/ui/Button';
import { 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  Menu, 
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  Store,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default categories requested
const CATEGORIES = [
  'Todos',
  'Garrafa',
  'Garrafa (PERSONALIZAR)',
  'Caneca',
  'Azulejo',
  'Caneleira',
  'Camiseta'
];

// Provided image URLs from user request
const INITIAL_PRODUCTS: Partial<Product>[] = [
  { name: 'Garrafa Premium VLM', price: 65.00, category: 'Garrafa', description: 'Nossa clássica garrafa pronta para sua arte.', imageUrl: 'https://i.postimg.cc/mgBgZdcz/Whats-App-Image-2026-04-29-at-14-51-56.jpg', hasComplements: true },
  { name: 'Caneca Editorial', price: 35.00, category: 'Caneca', description: 'Porcelana fina com sua identidade.', imageUrl: 'https://i.postimg.cc/2845Dp5r/Whats-App-Image-2026-04-29-at-14-51-56-(1).jpg' },
  { name: 'Garrafa Black Ops', price: 75.00, category: 'Garrafa', description: 'Edição limitada em alumínio negro.', imageUrl: 'https://i.postimg.cc/3JgwTMwh/Whats-App-Image-2026-04-29-at-14-51-56-(2).jpg', hasComplements: true },
  { name: 'Azulejo Memórias', price: 28.00, category: 'Azulejo', description: 'Sua foto favorita em cerâmica.', imageUrl: 'https://i.postimg.cc/BQxv0WvS/Whats-App-Image-2026-04-29-at-14-51-57.jpg' },
  { name: 'Caneleira VLM Pro', price: 55.00, category: 'Caneleira', description: 'Proteção com estilo no campo.', imageUrl: 'https://i.postimg.cc/WbM4vR42/Whats-App-Image-2026-04-29-at-14-51-57-(1).jpg' },
  { name: 'T-Shirt Organic', price: 89.00, category: 'Camiseta', description: 'Algodão 100% premium.', imageUrl: 'https://i.postimg.cc/cL0L1DvV/Whats-App-Image-2026-04-29-at-14-51-58.jpg' },
  { name: 'Garrafa Slim Silver', price: 59.00, category: 'Garrafa', description: 'Elegância metálica para o dia a dia.', imageUrl: 'https://i.postimg.cc/nhphVds8/Whats-App-Image-2026-04-29-at-14-51-58-(1).jpg', hasComplements: true },
  { name: 'Mug Studio Choice', price: 42.00, category: 'Caneca', description: 'Design minimalista e atemporal.', imageUrl: 'https://i.postimg.cc/RZ4ZCP3m/Whats-App-Image-2026-04-29-at-14-51-59.jpg' },
  { name: 'Garrafa Custom White', price: 65.00, category: 'Garrafa', description: 'O canvas perfeito para sua criatividade.', imageUrl: 'https://i.postimg.cc/htct4CJP/Whats-App-Image-2026-04-29-at-14-52-00.jpg', hasComplements: true },
  { name: 'Sports Flex Bottle', price: 48.00, category: 'Garrafa', description: 'Ergonomia para alta performance.', imageUrl: 'https://i.postimg.cc/pLRLV09L/Whats-App-Image-2026-04-29-at-14-52-01.jpg', hasComplements: true },
  { name: 'Caneca Vintage', price: 38.00, category: 'Caneca', description: 'Toque clássico para sua mesa.', imageUrl: 'https://i.postimg.cc/pLRLV092/Whats-App-Image-2026-04-29-at-14-52-02.jpg' },
  { name: 'Garrafa Thermo Gold', price: 85.00, category: 'Garrafa', description: 'Acabamento em ouro fosco.', imageUrl: 'https://i.postimg.cc/SxkxQZXJ/Whats-App-Image-2026-04-29-at-14-52-04.jpg', hasComplements: true },
  { name: 'Azulejo Floral', price: 32.00, category: 'Azulejo', description: 'Design botânico exclusivo.', imageUrl: 'https://i.postimg.cc/RVr0yC4Q/Whats-App-Image-2026-04-29-at-14-52-04-(1).jpg' },
  { name: 'Caneleira Impact Z', price: 62.00, category: 'Caneleira', description: 'Máxima absorção de impacto.', imageUrl: 'https://i.postimg.cc/pXNd4VRC/Whats-App-Image-2026-04-29-at-14-52-05.jpg' },
  { name: 'T-Shirt Urban', price: 95.00, category: 'Camiseta', description: 'Streetwear de alto padrão.', imageUrl: 'https://i.postimg.cc/vHRmk8b3/Whats-App-Image-2026-04-29-at-14-52-06.jpg' },
  { name: 'Caneca Abstract', price: 40.00, category: 'Caneca', description: 'Arte moderna em cada gole.', imageUrl: 'https://i.postimg.cc/8PhCS8zb/Whats-App-Image-2026-04-29-at-14-52-07.jpg' },
  { name: 'Garrafa Gradient Pink', price: 68.00, category: 'Garrafa', description: 'Transição suave de cores.', imageUrl: 'https://i.postimg.cc/yYFNHq8Q/Whats-App-Image-2026-04-29-at-14-52-08.jpg', hasComplements: true },
  { name: 'Azulejo Geometric', price: 30.00, category: 'Azulejo', description: 'Simetria e estilo.', imageUrl: 'https://i.postimg.cc/02pNsgyd/Whats-App-Image-2026-04-29-at-14-52-08-(1).jpg' },
  { name: 'Caneleira Pro Black', price: 65.00, category: 'Caneleira', description: 'Proteção máxima com acabamento premium.', imageUrl: 'https://i.postimg.cc/2845DpSG/Whats-App-Image-2026-04-29-at-14-52-08-(2).jpg' },
  { name: 'Garrafa Glossy White', price: 45.00, category: 'Garrafa', description: 'Brilho e sofisticação.', imageUrl: 'https://i.postimg.cc/RVc0Br09/Whats-App-Image-2026-04-29-at-14-52-09.jpg', hasComplements: true },
  { name: 'Mug Artistic Flow', price: 39.00, category: 'Caneca', description: 'Criatividade em cerâmica.', imageUrl: 'https://i.postimg.cc/9FGfh3Qg/Whats-App-Image-2026-04-29-at-14-52-09-(1).jpg' },
  { name: 'Garrafa Matte Black', price: 72.00, category: 'Garrafa', description: 'Textura suave e visual moderno.', imageUrl: 'https://i.postimg.cc/VLjN8ykH/Whats-App-Image-2026-04-29-at-14-52-09-(2).jpg', hasComplements: true },
  { name: 'Azulejo Classic Print', price: 25.00, category: 'Azulejo', description: 'Formatos tradicionais, artes únicas.', imageUrl: 'https://i.postimg.cc/VLjN8ykp/Whats-App-Image-2026-04-29-at-14-52-09-(3).jpg' },
  { name: 'T-Shirt Minimalist', price: 78.00, category: 'Camiseta', description: 'Menos é mais.', imageUrl: 'https://i.postimg.cc/Kc3z03SR/Whats-App-Image-2026-04-29-at-14-52-09-(4).jpg' },
];

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'customize' | 'checkout' | 'admin' | 'tracking'>('home');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', whatsapp: '', cep: '' });
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit'>('pix');

  // Simulation of Correios API for shipping calculation
  const calculateShipping = async () => {
    if (customerInfo.cep.length < 8) return;
    setCalculatingShipping(true);
    try {
      // Small simulation delay
      await new Promise(resolve => setTimeout(resolve, 800));
      // Base calculation logic: deterministic based on first digit of CEP
      const base = parseInt(customerInfo.cep[0]) || 5;
      const cost = 12 + (base * 3.5);
      setShippingCost(cost);
    } catch (e) {
      console.error("Shipping calculation error", e);
    } finally {
      setCalculatingShipping(false);
    }
  };
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const productsPath = 'products';
    const q = query(collection(db, productsPath));
    const unsubscribeProducts = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty && INITIAL_PRODUCTS.length > 0) {
        // Seed Firestore if empty
        const { addDoc, collection } = await import('firebase/firestore');
        for (const p of INITIAL_PRODUCTS) {
          await addDoc(collection(db, 'products'), { ...p, isActive: true });
        }
      } else {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, productsPath));

    // Handle deep links like /order/ID
    const path = window.location.pathname;
    if (path.startsWith('/order/')) {
      const orderId = path.split('/')[2];
      if (orderId) {
        fetchOrder(orderId);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && (u.email === 'viviane@x.com' || u.email === 'jessicajonas6425@gmail.com')) {
        setView('admin');
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, []);

  const fetchOrder = async (id: string) => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const orderDoc = await getDoc(doc(db, 'orders', id));
      if (orderDoc.exists()) {
        setTrackingOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        setView('tracking');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `orders/${id}`);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id && !item.isCustomized);
    if (existing) {
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl }]);
    }
  };

  const handlePersonalizationSave = (name: string, hasComplement: boolean, complementDescription?: string) => {
    if (customizingProduct) {
      setCart([...cart, { 
        productId: customizingProduct.id, 
        name: `${customizingProduct.name}${hasComplement ? ' + Complemento' : ''}`, 
        price: customizingProduct.price + (hasComplement ? 15 : 0), 
        quantity: 1, 
        isCustomized: true,
        personalizationName: name,
        hasExtraComplement: hasComplement,
        complementDescription: complementDescription,
        imageUrl: customizingProduct.imageUrl
      }]);
    }
    setView('home');
  };

  const submitOrder = async () => {
    if (!customerInfo.name || !customerInfo.whatsapp || !customerInfo.cep) {
      alert("Por favor, preencha todos os dados e calcule o frete.");
      return;
    }

    if (shippingCost === null) {
      alert("Por favor, calcule o frete.");
      return;
    }

    const productsTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = productsTotal + shippingCost;
    
    const orderData: Order = {
      customerName: customerInfo.name,
      customerWhatsapp: customerInfo.whatsapp,
      cep: customerInfo.cep,
      shippingCost: shippingCost,
      paymentMethod: paymentMethod,
      items: cart,
      total: total,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // WhatsApp message generation with full details
      const trackingLink = `${window.location.origin}/?orderId=${docRef.id}`;
      const paymentLabels = { pix: 'PIX', credit: 'Cartão de Crédito', debit: 'Cartão de Débito' };
      
      let message = `*NOVO PEDIDO - ATELIÊ VLM*\n\n`;
      message += `*Cliente:* ${customerInfo.name}\n`;
      message += `*WhatsApp:* ${customerInfo.whatsapp}\n`;
      message += `*CEP:* ${customerInfo.cep}\n\n`;
      
      message += `*ITENS:*\n`;
      cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2)})${item.personalizationName ? `\n  Nome: ${item.personalizationName}` : ''}${item.complementDescription ? `\n  Comp: ${item.complementDescription}` : ''}\n`;
      });
      
      message += `\n*FINANCEIRO:*\n`;
      message += `Subtotal: R$ ${productsTotal.toFixed(2)}\n`;
      message += `Frete: R$ ${shippingCost.toFixed(2)}\n`;
      message += `*TOTAL: R$ ${total.toFixed(2)}*\n\n`;
      message += `*PAGAMENTO:* ${paymentLabels[paymentMethod]}\n\n`;
      message += `Acompanhe pelo link:\n${trackingLink}`;
      
      const whatsappUrl = `https://wa.me/5511940288573?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      setCart([]);
      setCustomerInfo({ name: '', whatsapp: '', cep: '' });
      setShippingCost(null);
      setView('home');
      alert("Pedido realizado com sucesso!");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'orders');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Attempting admin login for:", adminEmail);
      
      // Ensure we are signed out first to avoid mixed sessions
      await auth.signOut();
      
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (signInError: any) {
        console.log("Sign in failed with code:", signInError.code);
        
        // If the admin user doesn't exist, try creating it (specifically for the requested one)
        if ((adminEmail === 'viviane@x.com' || adminEmail === 'jessicajonas6425@gmail.com') && (
          signInError.code === 'auth/user-not-found' || 
          signInError.code === 'auth/invalid-credential' ||
          signInError.code === 'auth/invalid-login-credentials'
        )) {
          console.log("User not found, attempting registration for authorized admin");
          userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        } else {
          throw signInError;
        }
      }

      if (userCredential && userCredential.user) {
        console.log("Login successful:", userCredential.user.email);
        setShowAdminLogin(false);
        // The view state will be updated by onAuthStateChanged
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      
      let errorMessage = "Falha no login admin.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta para esta conta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "Esta conta foi desativada.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Esta conta já existe com uma senha diferente.";
      } else {
        errorMessage = `Erro (${error.code}): ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const filteredProducts = activeCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-red-50 font-sans">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-3 px-8 text-[10px] font-bold uppercase tracking-[0.3em] flex justify-between items-center relative z-50">
        <div className="flex gap-8">
          <span className="flex items-center gap-2 font-mono"><Smartphone size={12} className="text-red-500" /> +55 11 94028-8573</span>
          <span className="hidden md:flex items-center gap-2"><Mail size={12} className="text-red-500" /> atelievlm@gmail.com</span>
        </div>
        <div className="flex gap-8">
          <button onClick={() => setView('tracking')} className="hover:text-red-500 transition-colors">Rastrear Pedido</button>
          <button onClick={() => setShowAdminLogin(true)} className="hover:text-red-500 transition-colors">Admin</button>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-8 py-8 md:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Logo */}
          <div className="flex items-baseline space-x-4 cursor-pointer group" onClick={() => setView('home')}>
            <h1 className="text-5xl font-serif font-black tracking-tighter italic group-hover:text-[#E30613] transition-all duration-500">VLM</h1>
            <div className="hidden lg:flex flex-col border-l border-slate-200 pl-4">
              <span className="text-[9px] uppercase tracking-[0.4em] font-light leading-none opacity-40">Atelier de</span>
              <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#E30613] leading-none mt-1 text-black">Brindes</span>
            </div>
          </div>

          {/* Search Bar (Structural Copy) */}
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              placeholder="O que você está procurando no ateliê?" 
              className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all"
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('checkout')} 
              className="group flex items-center gap-4 bg-slate-50 hover:bg-red-50 px-8 py-4 rounded-full transition-all border border-slate-100 hover:border-red-100"
              id="cart-btn"
            >
              <ShoppingBag className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-300 group-hover:text-red-300">Meu Carrinho</span>
                <span className="text-[11px] font-bold text-black">{cart.length} itens</span>
              </div>
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden p-4 border border-slate-200 rounded-full"
              id="mobile-menu-btn"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Categories Bar (Desktop) */}
        <div className="hidden md:block mt-8 max-w-7xl mx-auto border-t border-slate-50 pt-6">
          <nav className="flex justify-center gap-12 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setView('home'); }}
                className={cn(
                  "text-[10px] uppercase font-bold tracking-[0.3em] pb-4 border-b-2 transition-all whitespace-nowrap",
                  activeCategory === cat ? "border-red-600 text-red-600" : "border-transparent text-slate-400 hover:text-black"
                )}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-[#FCFAF7] pt-40 px-12 flex flex-col md:hidden"
          >
            <div className="flex flex-col gap-12">
              <div className="vlm-label">Navegação</div>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setView('home'); setIsMenuOpen(false); }}
                  className={cn(
                    "block text-6xl font-serif text-left font-black transition-all duration-700",
                    activeCategory === cat ? "text-black italic pl-6" : "text-slate-200 hover:text-black"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen">
        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 lg:p-12"
              >
                <header className="mb-20 relative">
                  <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-red-500/5 rounded-full blur-[120px] -z-10"></div>
                  <div className="vlm-label mb-6">Coleção Elite MMXXVI</div>
                  <h2 className="text-6xl md:text-8xl font-serif leading-[0.9] tracking-tighter mb-10 font-black italic text-black">
                    O Melhor em<br/>
                    <span className="text-[#E30613] uppercase not-italic">Brindes.</span>
                  </h2>
                  <p className="text-slate-500 max-w-xl font-sans font-medium uppercase text-xs tracking-[0.2em] leading-relaxed border-l-2 border-red-500 pl-8 transition-colors duration-1000">
                    Sua marca merece o extraordinário. Brindes que elevam a percepção de valor e fidelizam com sofisticação.
                  </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart}
                      onCustomize={(p) => { setCustomizingProduct(p); setView('customize'); }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

          {view === 'customize' && customizingProduct && (
            <motion.div 
              key="customize-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-7xl mx-auto px-4 py-20"
            >
              <div className="mb-12 flex items-center justify-between">
                <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-500 hover:text-black font-bold uppercase text-[10px] tracking-widest transition-colors font-sans">
                  <ArrowLeft className="w-4 h-4" /> VOLTAR AO ACERVO
                </button>
              </div>
              <SimplePersonalizer 
                product={customizingProduct} 
                onSave={handlePersonalizationSave}
                onCancel={() => setView('home')}
              />
            </motion.div>
          )}

          {view === 'checkout' && (
            <motion.div 
              key="checkout-view"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="px-8 py-20"
            >
              <h2 className="text-6xl font-serif italic tracking-tighter mb-16 text-black leading-none">Seu Orçamento.</h2>
              {cart.length === 0 ? (
                <div className="vlm-card p-20 text-center bg-slate-50 border-dashed">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-8 text-slate-200 stroke-[1px]" />
                  <p className="text-2xl font-serif italic text-gray-700 mb-10">Não há produtos selecionados para cotação.</p>
                  <Button size="lg" onClick={() => setView('home')} id="start-shopping">VER BRINDES</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  <div className="space-y-8">
                    {cart.map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-100 p-8 flex items-center justify-between group hover:border-red-500/30 transition-all">
                        <div className="flex-1">
                          <h4 className="text-2xl font-serif italic text-black mb-1">{item.name}</h4>
                          {item.personalizationName && (
                            <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mt-1">NOME: {item.personalizationName}</p>
                          )}
                          {item.complementDescription && (
                            <p className="text-[10px] font-black uppercase text-black tracking-widest mt-1">DETALHE: {item.complementDescription}</p>
                          )}
                          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.1em] mt-2">{item.quantity} un &times; R$ {item.price.toFixed(2)}</p>
                        </div>
                        <span className="text-2xl font-serif font-black text-red-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-12 flex flex-col items-end border-t border-slate-100">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">Total Estimado</span>
                      <span className="text-7xl font-serif font-black italic tracking-tighter text-black">
                        R$ {cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="vlm-card p-10 bg-white">
                    <h3 className="text-3xl font-serif italic mb-10 text-black">Informações para Contato.</h3>
                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Nome / Empresa</label>
                        <input 
                          className="vlm-input w-full text-xl font-serif italic"
                          value={customerInfo.name}
                          onChange={(e: any) => setCustomerInfo({...customerInfo, name: e.target.value})}
                          placeholder="Quem solicita?"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">WhatsApp de Resposta</label>
                        <input 
                          className="vlm-input w-full text-xl font-mono"
                          type="tel" 
                          value={customerInfo.whatsapp}
                          onChange={(e: any) => setCustomerInfo({...customerInfo, whatsapp: e.target.value})}
                          placeholder="( ) 00000-0000"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">CEP de Entrega</label>
                          <div className="flex gap-4">
                            <input 
                              className="vlm-input flex-1 text-xl font-mono"
                              value={customerInfo.cep}
                              onChange={(e: any) => setCustomerInfo({...customerInfo, cep: e.target.value.replace(/\D/g, '').slice(0, 8)})}
                              placeholder="00000-000"
                            />
                            <Button 
                              variant="outline" 
                              onClick={calculateShipping}
                              disabled={calculatingShipping || customerInfo.cep.length < 8}
                            >
                              {calculatingShipping ? '...' : 'CALCULAR'}
                            </Button>
                          </div>
                        </div>
                        {shippingCost !== null && (
                          <div className="bg-slate-50 p-6 flex items-center justify-between border border-slate-900/5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Frete Estimado</span>
                            <span className="text-xl font-serif font-black text-black">R$ {shippingCost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-6">Forma de Pagamento</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(['pix', 'credit', 'debit'] as const).map((method) => (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method)}
                              className={cn(
                                "flex items-center justify-center gap-4 p-6 border transition-all uppercase text-[10px] font-black tracking-widest",
                                paymentMethod === method 
                                  ? "bg-black text-white border-black" 
                                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                              )}
                            >
                              {method === 'pix' ? 'PIX' : method === 'credit' ? 'Crédito' : 'Débito'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        size="lg" 
                        className="w-full mt-10 h-24 text-lg bg-red-600 hover:bg-black" 
                        onClick={submitOrder} 
                        id="finish-order-btn"
                        disabled={!customerInfo.name || !customerInfo.whatsapp || shippingCost === null}
                      >
                        FINALIZAR E ENVIAR WHATSAPP
                      </Button>
                      <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-[0.2em] mt-8 italic">Seus dados estão protegidos sob nossa política de privacidade.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'tracking' && trackingOrder && (
            <motion.div 
              key="tracking-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto px-12 py-32 mt-10 bg-white border border-slate-900/5 shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 p-12">
                <div className="bg-orange-500 text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em]">
                  {trackingOrder.status}
                </div>
              </div>

              <div className="mb-24">
                <h2 className="text-7xl font-serif font-black italic tracking-tighter leading-none mb-6">Manifesto.</h2>
                <p className="text-slate-300 font-mono text-[10px] uppercase tracking-[0.4em]">Reference: {trackingOrder.id}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="space-y-16">
                  <div className="border-l-4 border-red-600 pl-8">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Identificação do Pedido</p>
                    <p className="text-4xl font-serif italic mb-2 text-black">{trackingOrder.customerName}</p>
                    <p className="text-xs font-black uppercase text-red-600 tracking-widest">{trackingOrder.customerWhatsapp}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Conteúdo do Pedido</p>
                    <div className="space-y-8">
                      {trackingOrder.items.map((item, idx) => (
                        <div key={idx} className="flex gap-6 border-b border-slate-900/5 pb-8">
                          {item.imageUrl && (
                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 flex-shrink-0">
                               <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-gray-600 font-sans font-black uppercase text-[10px] tracking-wide italic">{item.quantity}x {item.name}</span>
                              <span className="font-serif font-bold italic text-black text-lg">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            {item.personalizationName && (
                              <p className="text-[9px] font-black uppercase text-red-600 tracking-[0.2em]">PERSONALIZADO: {item.personalizationName}</p>
                            )}
                            {item.complementDescription && (
                              <p className="text-[9px] font-black uppercase text-black tracking-[0.2em] mt-1">COMPLEMENTO: {item.complementDescription}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <div className="space-y-4 pt-6">
                        <div className="flex justify-between items-center text-slate-400 font-black uppercase text-[11px] tracking-widest">
                          <span>Subtotal</span>
                          <span>R$ {(trackingOrder.total - (trackingOrder.shippingCost || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 font-black uppercase text-[11px] tracking-widest">
                          <span>Frete</span>
                          <span>R$ {trackingOrder.shippingCost?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="pt-6 flex justify-between items-center text-4xl font-serif font-black text-black border-t border-slate-900/10">
                          <span className="italic uppercase text-xs tracking-[0.4em] text-slate-300">Total Final.</span>
                          <span>R$ {trackingOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <Button size="lg" className="w-full h-20" onClick={() => setView('home')}>Continue Journey</Button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'admin' && user && (
            <motion.div 
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <AdminPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>

    <footer className="mt-auto border-t border-slate-100 py-24 px-8 lg:px-24 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 relative z-10">
          <div className="max-w-md">
            <h3 className="text-5xl font-serif italic font-black mb-8 text-red-600">Ateliê VLM.</h3>
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-gray-700 leading-relaxed mb-12">
              Mais de 70.000 opções de brindes corporativos para sua empresa. Qualidade, exclusividade e entrega rápida.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-4 bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 transition-all rounded-full"><Instagram size={20} /></a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Atendimento</h4>
              <ul className="space-y-4 text-lg font-serif italic text-black">
                <li><button onClick={() => setView('home')} className="hover:text-red-500 transition-colors">Produtos</button></li>
                <li><button onClick={() => setView('tracking')} className="hover:text-red-500 transition-colors">Rastreio</button></li>
                <li><button onClick={() => setShowAdminLogin(true)} className="hover:text-red-500 transition-colors">Acesso Restrito</button></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Fale Conosco</h4>
              <ul className="space-y-4 text-xs font-sans font-bold uppercase tracking-[0.1em] text-slate-600">
                <li className="flex items-center gap-3 font-mono"><Smartphone size={16} className="text-red-500" /> +55 11 94028-8573</li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-red-500" /> atelievlm@gmail.com</li>
                <li className="mt-8 text-red-600 font-black">SÃO PAULO . BR</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 italic">© 2026 ATELIÊ VLM . TODOS OS DIREITOS RESERVADOS</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-8 md:mt-0 cursor-pointer hover:text-red-600 transition-colors flex items-center gap-3" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>VOLTAR AO TOPO &uarr;</span>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            key="login-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 p-20 max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
              <button 
                onClick={() => setShowAdminLogin(false)} 
                className="absolute top-10 right-10 p-4 hover:bg-slate-50 transition-all rounded-full"
                id="close-login-btn"
              >
                <X className="w-6 h-6 stroke-slate-300 stroke-[1px]" />
              </button>
              
              <div className="mb-16">
                <div className="vlm-label">Acesso Administrativo</div>
                <h3 className="text-5xl font-serif italic leading-tight mb-4 font-black text-black">Ateliê VLM.<br/>Controle.</h3>
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-300">Autenticação de Segurança</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-12">
                <div>
                  <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] block mb-3">E-mail de Acesso</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="DIGITE SEU E-MAIL"
                    value={adminEmail}
                    onChange={(e: any) => setAdminEmail(e.target.value)}
                    className="vlm-input w-full text-xl font-serif"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] block mb-3">Chave Mestra</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e: any) => setAdminPassword(e.target.value)}
                    className="vlm-input w-full text-xl font-mono text-slate-400"
                  />
                </div>
                <Button type="submit" className="w-full h-20 text-lg bg-red-600 hover:bg-black" id="login-submit-btn">
                  ENTRAR NO SISTEMA
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AIAssistant />
      <FloatingWhatsApp />
    </div>
  );
}
