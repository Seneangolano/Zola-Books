import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Check, 
  Download, 
  BookOpen, 
  Copy, 
  Sparkles,
  ArrowLeft,
  Clock,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { PaymentMethod, Order } from '../types';
import { api } from '../services/api';
import { triggerHapticFeedback } from '../lib/haptic';
import { capturePaymentError } from '../lib/sentry';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    formatPrice,
    cartSubtotalAOA,
    cartSubtotalUSD,
    currency,
    currentUser,
    createNewOrder,
    setActiveView,
    addNotification
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('multicaixa_express');
  const [phoneNumber, setPhoneNumber] = useState('923456789');
  const [ibanProofName, setIbanProofName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Multicaixa Reference state
  const [generatedReferenceData, setGeneratedReferenceData] = useState<{
    entityId: string;
    reference: string;
    amountAOA: number;
    expiresAt: string;
  } | null>(null);
  const [isGeneratingRef, setIsGeneratingRef] = useState(false);

  useEffect(() => {
    if (!isCheckoutOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckoutOpen, setIsCheckoutOpen]);

  const handleGenerateMcxReference = async () => {
    setIsGeneratingRef(true);
    try {
      triggerHapticFeedback('light');
      const res = await api.generateMulticaixaReference({
        amountAOA: cartSubtotalAOA,
        userEmail: currentUser.email,
        userName: currentUser.name,
        items: cart.map(i => ({ bookTitle: i.book.title, priceAOA: i.book.priceAOA }))
      });
      setGeneratedReferenceData({
        entityId: res.entityId,
        reference: res.reference,
        amountAOA: res.amountAOA,
        expiresAt: res.expiresAt
      });
      addNotification(
        'Código de Referência Gerado 🏧',
        `Entidade: ${res.entityId} | Ref: ${res.reference}. Válido por 24 horas no Multicaixa Express / Caixas Automáticos.`
      );
    } catch (err: any) {
      addNotification('Erro ao gerar referência', err.message);
    } finally {
      setIsGeneratingRef(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    let generatedRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    try {

      if (paymentMethod === 'stripe_card' || paymentMethod === 'paypal') {
        const stripeRes = await api.processStripePayment({
          items: cart.map(item => ({
            bookTitle: item.book.title,
            priceUSD: item.book.priceUSD
          })),
          userEmail: currentUser.email,
          userName: currentUser.name,
          totalUSD: cartSubtotalUSD
        });

        if (stripeRes.checkoutUrl) {
          window.open(stripeRes.checkoutUrl, '_blank');
        }
        generatedRef = stripeRes.transactionReference || stripeRes.paymentIntentId || `STRIPE-${Math.floor(100000 + Math.random() * 900000)}`;
        addNotification('Stripe Processado', 'Pagamento internacional com cartão registado com sucesso.');
      } else if (paymentMethod === 'multicaixa_express') {
        const mcxRes = await api.processMulticaixaPayment({
          phoneNumber,
          amountAOA: cartSubtotalAOA,
          userEmail: currentUser.email,
          userName: currentUser.name,
          items: cart.map(item => ({ bookTitle: item.book.title, priceAOA: item.book.priceAOA }))
        });
        generatedRef = `MCX-REF-${mcxRes.reference || Math.floor(100000000 + Math.random() * 900000000)}`;
        addNotification('Multicaixa Express', `Notificação enviada para +244 ${phoneNumber}. Referência EMIS: ${mcxRes.reference}`);
      } else if (paymentMethod === 'mcx_reference') {
        let refData = generatedReferenceData;
        if (!refData) {
          const res = await api.generateMulticaixaReference({
            amountAOA: cartSubtotalAOA,
            userEmail: currentUser.email,
            userName: currentUser.name,
            items: cart.map(item => ({ bookTitle: item.book.title, priceAOA: item.book.priceAOA }))
          });
          refData = {
            entityId: res.entityId,
            reference: res.reference,
            amountAOA: res.amountAOA,
            expiresAt: res.expiresAt
          };
          setGeneratedReferenceData(refData);
        }
        generatedRef = `EMIS-REF-${refData.reference} (Entidade: ${refData.entityId})`;
        addNotification(
          'Referência Multicaixa Registada 🏧',
          `Pedido criado com sucesso! Pague via Entidade ${refData.entityId} / Referência ${refData.reference} para validação assíncrona.`,
          'promotion'
        );
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const orderData: Partial<Order> = {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        items: cart.map(item => ({
          bookId: item.book.id,
          bookTitle: item.book.title,
          price: item.book.priceAOA,
          currency: 'AOA'
        })),
        totalAOA: cartSubtotalAOA,
        totalUSD: cartSubtotalUSD,
        currencyPaid: currency,
        amountPaid: currency === 'AOA' ? cartSubtotalAOA : cartSubtotalUSD,
        paymentMethod: paymentMethod,
        paymentReference: generatedRef,
        ibanProofUrl: ibanProofName ? 'comprovativo_iban_upload.pdf' : undefined,
        discountAmount: 0
      };

      const newOrd = await createNewOrder(orderData);
      setCompletedOrder(newOrd);

      // Trigger Haptic Feedback on successful purchase!
      triggerHapticFeedback('success');

      // Trigger Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err: any) {
      capturePaymentError(err, {
        method: paymentMethod,
        amountAOA: cartSubtotalAOA,
        amountUSD: cartSubtotalUSD,
        phoneNumber,
        reference: generatedRef
      });
      triggerHapticFeedback('error');
      addNotification('Erro no Pagamento', err.message || 'Falha ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto p-6 space-y-6"
          >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 id="checkout-modal-title" className="font-extrabold text-lg text-white">Checkout Seguro Zola Books</h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Fechar janela de checkout"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          /* Order Confirmation Screen */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Pagamento Confirmado!</h3>
              <p className="text-xs text-slate-300">
                O teu pedido <span className="font-mono text-amber-400 font-bold">#{completedOrder.id}</span> foi processado com sucesso.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-left text-xs space-y-2">
              <p className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Resumo do Licenciamento Digital:</p>
              <p><span className="text-slate-400">Comprador:</span> {completedOrder.userName} ({completedOrder.userEmail})</p>
              <p><span className="text-slate-400">Método:</span> {completedOrder.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              <p><span className="text-slate-400">Referência:</span> <span className="font-mono text-emerald-400">{completedOrder.paymentReference}</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setActiveView('library');
                }}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ir para Minha Biblioteca &amp; Ler Agora</span>
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form Screen */
          <form onSubmit={handleProcessPayment} className="space-y-6">
            
            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Escolha o Método de Pagamento:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('multicaixa_express')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                    paymentMethod === 'multicaixa_express'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Multicaixa Express</span>
                  <span className="text-[10px] font-normal text-slate-400">Notificação no Telefone</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('mcx_reference')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                    paymentMethod === 'mcx_reference'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Referência Multicaixa</span>
                  <span className="text-[10px] font-normal text-amber-300/80 font-medium">Pagamento Assíncrono / ATM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bai_directo')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                    paymentMethod === 'bai_directo'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>BAI Directo</span>
                  <span className="text-[10px] font-normal text-slate-400">Referência Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('unitel_money')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                    paymentMethod === 'unitel_money'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Unitel Money</span>
                  <span className="text-[10px] font-normal text-slate-400">Carteira Móvel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('iban_transfer')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                    paymentMethod === 'iban_transfer'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>Transferência IBAN</span>
                  <span className="text-[10px] font-normal text-slate-400">BCI / BAI / BFA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe_card')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                    paymentMethod === 'stripe_card'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Cartão de Crédito</span>
                  <span className="text-[10px] font-normal text-slate-400">Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col gap-1 ${
                    paymentMethod === 'paypal'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>PayPal</span>
                  <span className="text-[10px] font-normal text-slate-400">Conta Global</span>
                </button>
              </div>
            </div>

            {/* Method Inputs Details */}
            {paymentMethod === 'multicaixa_express' && (
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">Número de Telefone Multicaixa Express (Angola):</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-slate-900 px-3 py-2 rounded-xl text-slate-300 font-bold border border-slate-700">
                    +244
                  </span>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9XX XXX XXX"
                    className="flex-1 bg-slate-900 text-sm text-slate-100 p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Aprova a notificação push no aplicativo Multicaixa Express do teu telemóvel para concluir a compra.
                </p>
              </div>
            )}

            {paymentMethod === 'mcx_reference' && (
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-amber-500/30 space-y-3.5 text-xs">
                <div className="border-b border-slate-700/80 pb-2.5">
                  <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    Pagamento por Referência Multicaixa (EMIS / ATM / Express)
                  </span>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Sem necessidade de cartão internacional. Pague em qualquer Caixa Automático (ATM) ou no aplicativo Multicaixa Express na opção <strong className="text-amber-300">Pagamentos &gt; Pagamentos por Referência</strong>.
                  </p>
                </div>

                {!generatedReferenceData ? (
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 text-center space-y-2.5">
                    <p className="text-xs text-slate-300">
                      Gere o código de referência oficial EMIS associado ao teu carrinho de compras.
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateMcxReference}
                      disabled={isGeneratingRef}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isGeneratingRef ? (
                        <span>A Gerar Referência EMIS...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>Gerar Código de Referência Multicaixa (Pagamento Assíncrono)</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-xl space-y-2.5 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Referência EMIS Ativa
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-amber-400" /> Validade: 24h
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block">ENTIDADE</span>
                          <span className="font-mono font-black text-amber-300 text-sm">{generatedReferenceData.entityId}</span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block">REFERÊNCIA</span>
                          <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">{generatedReferenceData.reference}</span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block">MONTANTE</span>
                          <span className="font-mono font-black text-white text-xs">{generatedReferenceData.amountAOA.toLocaleString('pt-AO')} Kz</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            const textToCopy = `Entidade: ${generatedReferenceData.entityId} | Referência: ${generatedReferenceData.reference} | Montante: ${generatedReferenceData.amountAOA} Kz`;
                            navigator.clipboard.writeText(textToCopy);
                            triggerHapticFeedback('light');
                            addNotification('Copiado! 📋', 'Dados da Referência EMIS copiados para a área de transferência.');
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Dados de Pagamento</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleGenerateMcxReference}
                          className="text-slate-400 hover:text-slate-200 text-[10px] underline"
                        >
                          Gerar Nova Referência
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-2.5 text-[11px] text-amber-200">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Validação Assíncrona:</strong> Ao concluir o pedido, a plataforma valida a transferência de forma assíncrona assim que efetuar o pagamento no ATM ou app Multicaixa.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'iban_transfer' && (
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-amber-400 block">Dados de Transferência Bancária Zola Books:</span>
                <p className="font-mono text-slate-200">BANCO BAI: AO06 0040 0000 1234 5678 1019 1</p>
                <p className="font-mono text-slate-200">BANCO BFA: AO06 0006 0000 9876 5432 1011 2</p>
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Carregar Comprovativo (PDF/Imagem):</span>
                  <input
                    type="file"
                    onChange={(e) => setIbanProofName(e.target.files?.[0]?.name || '')}
                    className="text-xs text-slate-300 bg-slate-900 p-2 rounded-xl w-full border border-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Total & Submit Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total a Pagar:</span>
                <span className="text-xl font-black text-amber-400">
                  {formatPrice(cartSubtotalAOA, cartSubtotalUSD)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing || cart.length === 0}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>A Processar Pagamento...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmar &amp; Pagar</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
