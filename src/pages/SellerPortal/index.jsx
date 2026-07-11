import React, { useEffect, useState } from 'react';
import { lotsApi } from '../../api';
import DevFooter from '../../components/DevFooter';
import toast from 'react-hot-toast';
import { useFirebaseStorage } from '../../hooks/useFirebaseStorage';

const WIZARD_STEPS = [
  'Item Details & Photos',
  'Condition Report',
  'Auction Type & Reserve',
  'Schedule & EMD',
  'Submit for Approval',
];

const AUCTION_TYPES = ['ENGLISH','DUTCH','SEALED','REVERSE','LIVE'];

const emptyForm = {
  title: '', description: '', category: '', photoUrls: [],
  conditionReport: '', provenance: '',
  auctionType: 'ENGLISH', startingBid: '', reservePrice: '', minIncrement: '500',
  buyerPremiumPct: '10', emdRequired: '',
  startAt: '', endAt: '', previewStart: '', previewEnd: '',
};

export default function SellerPortal() {
  const [lots, setLots] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { uploadPhoto, uploading, progress } = useFirebaseStorage();
  const draftId = React.useRef(Date.now().toString());

  useEffect(() => {
    lotsApi.getMyLots().then(r => setLots(r.data)).catch(() => {});
  }, []);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhotoUpload = async e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const urls = await Promise.all(files.map(f => uploadPhoto(f, draftId.current)));
      setField('photoUrls', [...(form.photoUrls || []), ...urls]);
      toast.success(`${urls.length} photo${urls.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Photo upload failed');
    }
  };

  const submitLot = async () => {
    setSubmitting(true);
    try {
      await lotsApi.createLot({
        ...form,
        startingBid: Number(form.startingBid),
        reservePrice: form.reservePrice ? Number(form.reservePrice) : undefined,
        minIncrement: Number(form.minIncrement),
        buyerPremiumPct: Number(form.buyerPremiumPct),
        emdRequired: form.emdRequired ? Number(form.emdRequired) : undefined,
      });
      toast.success('Lot submitted for admin approval!');
      setShowWizard(false);
      setForm(emptyForm);
      setStep(0);
      lotsApi.getMyLots().then(r => setLots(r.data)).catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const activeLots = lots.filter(l => l.status === 'LIVE').length;
  const totalGmv = lots.filter(l => l.status === 'SOLD')
    .reduce((s, l) => s + Number(l.currentBid || 0), 0);
  const soldCount = lots.filter(l => l.status === 'SOLD').length;
  const sellThrough = lots.length ? Math.round((soldCount / lots.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">Paddle <span>&</span> Post<br />
          <span style={{ fontSize: '0.7rem', color: 'rgba(243,236,221,.5)' }}>Seller Portal</span>
        </div>
        <nav className="sidebar-nav">
          {['Dashboard','My Lots','Payouts','Analytics'].map(l => (
            <a key={l} href="#" className="sidebar-link active">{l}</a>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: 24, overflowY: 'auto', paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Seller Portal</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem' }}>Dashboard</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowWizard(true)}>
            + Create New Lot
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Active Lots',       value: activeLots },
            { label: 'Total GMV',         value: `₹${totalGmv.toLocaleString('en-IN')}` },
            { label: 'Sell-Through Rate', value: `${sellThrough}%` },
            { label: 'Pending Approval',  value: lots.filter(l => l.status === 'PENDING_APPROVAL').length },
          ].map(s => (
            <div key={s.label} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 700,
                             color: '#16261F', marginBottom: 4 }}>{s.value}</div>
              <div className="eyebrow" style={{ color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Lots Table */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0d8cc' }}>
            <div className="eyebrow">My Lots</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Lot #</th><th>Title</th><th>Type</th>
                <th>Status</th><th>Current Bid</th><th>Bids</th>
              </tr>
            </thead>
            <tbody>
              {lots.map(lot => (
                <tr key={lot.id}>
                  <td><span className="lot-meta">{lot.lotNumber}</span></td>
                  <td style={{ fontWeight: 500, maxWidth: 240 }}>{lot.title}</td>
                  <td><span className="lot-meta">{lot.auctionType}</span></td>
                  <td>
                    <span className={`badge badge-${
                      lot.status === 'LIVE' ? 'live' :
                      lot.status === 'SOLD' ? 'sold' : 'pending'
                    }`}>{lot.status}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    {lot.currentBid ? `₹${Number(lot.currentBid).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td>{lot.bidCount}</td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                  No lots yet. Create your first lot!
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Wizard Modal ─────────────────────────────────────────────────── */}
      {showWizard && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <div className="eyebrow" style={{ color: '#C89B3C', marginBottom: 4 }}>
                  Step {step + 1} of {WIZARD_STEPS.length}
                </div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#F3ECDD' }}>
                  {WIZARD_STEPS[step]}
                </h2>
              </div>
              <button onClick={() => setShowWizard(false)}
                style={{ background: 'none', border: 'none', color: '#F3ECDD', fontSize: '1.4rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            {/* Step progress */}
            <div style={{ display: 'flex', gap: 4, padding: '12px 24px', background: 'rgba(0,0,0,.2)' }}>
              {WIZARD_STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                  background: i <= step ? '#C89B3C' : 'rgba(255,255,255,.15)' }} />
              ))}
            </div>

            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              {step === 0 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" value={form.title}
                      onChange={e => setField('title', e.target.value)} placeholder="e.g. Kashmiri Pashmina Shawl" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input" value={form.category}
                      onChange={e => setField('category', e.target.value)}>
                      <option value="">Select category</option>
                      {['Textiles & Apparel','Fine Art & Paintings','Furniture & Antiques',
                        'Decorative Arts','Jewellery','Books & Manuscripts'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={4} value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      placeholder="Detailed description of the item…" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Photos (max 20)</label>
                    <input type="file" accept="image/*" multiple
                      onChange={handlePhotoUpload} disabled={uploading}
                      style={{ fontSize: '0.85rem' }} />
                    {uploading && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ height: 4, background: '#e0d8cc', borderRadius: 2 }}>
                          <div style={{ width: `${progress}%`, height: '100%',
                                         background: '#C89B3C', borderRadius: 2,
                                         transition: 'width .2s' }} />
                        </div>
                        <div className="lot-meta" style={{ marginTop: 4 }}>Uploading… {progress}%</div>
                      </div>
                    )}
                    {form.photoUrls?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {form.photoUrls.map((url, i) => (
                          <img key={i} src={url} alt="" style={{ width: 56, height: 56,
                            objectFit: 'cover', borderRadius: 4, border: '1px solid #e0d8cc' }} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Condition Report</label>
                    <textarea className="form-input" rows={5} value={form.conditionReport}
                      onChange={e => setField('conditionReport', e.target.value)}
                      placeholder="Describe the condition, any wear, repairs, etc." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Provenance</label>
                    <textarea className="form-input" rows={4} value={form.provenance}
                      onChange={e => setField('provenance', e.target.value)}
                      placeholder="History of ownership, exhibition records, certificates…" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Auction Type *</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {AUCTION_TYPES.map(t => (
                        <button key={t} type="button"
                          className={`btn btn-sm ${form.auctionType === t ? 'btn-dark' : 'btn-outline'}`}
                          onClick={() => setField('auctionType', t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Starting Bid (₹) *</label>
                      <input className="form-input" type="number" value={form.startingBid}
                        onChange={e => setField('startingBid', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reserve Price (₹) — Confidential</label>
                      <input className="form-input" type="number" value={form.reservePrice}
                        onChange={e => setField('reservePrice', e.target.value)}
                        placeholder="Optional — encrypted at rest" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Min Increment (₹)</label>
                      <input className="form-input" type="number" value={form.minIncrement}
                        onChange={e => setField('minIncrement', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Buyer's Premium (%)</label>
                      <input className="form-input" type="number" value={form.buyerPremiumPct}
                        onChange={e => setField('buyerPremiumPct', e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Preview Start</label>
                      <input className="form-input" type="datetime-local" value={form.previewStart}
                        onChange={e => setField('previewStart', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preview End</label>
                      <input className="form-input" type="datetime-local" value={form.previewEnd}
                        onChange={e => setField('previewEnd', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Auction Start</label>
                      <input className="form-input" type="datetime-local" value={form.startAt}
                        onChange={e => setField('startAt', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Auction End</label>
                      <input className="form-input" type="datetime-local" value={form.endAt}
                        onChange={e => setField('endAt', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">EMD Required (₹)</label>
                    <input className="form-input" type="number" value={form.emdRequired}
                      onChange={e => setField('emdRequired', e.target.value)}
                      placeholder="Leave blank if no EMD required" />
                  </div>
                </>
              )}

              {step === 4 && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
                  <h3 style={{ fontFamily: 'Georgia, serif', marginBottom: 8 }}>Ready to Submit</h3>
                  <p style={{ color: '#888', marginBottom: 20, fontSize: '0.88rem' }}>
                    Your lot will be reviewed by our admin team before going live.
                    Approval typically takes 1–2 business days.
                  </p>
                  <div style={{ background: '#f9f6f0', borderRadius: 8, padding: 16,
                                textAlign: 'left', marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{form.title || '(No title)'}</div>
                    <div className="lot-meta">{form.category} · {form.auctionType}</div>
                    <div className="lot-meta">Starting: ₹{Number(form.startingBid || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,.1)',
                          display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-outline" style={{ color: '#F3ECDD', borderColor: 'rgba(243,236,221,.3)' }}
                onClick={() => step > 0 ? setStep(s => s - 1) : setShowWizard(false)}>
                {step === 0 ? 'Cancel' : '← Back'}
              </button>
              {step < WIZARD_STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}
                  disabled={step === 0 && (!form.title || !form.category)}>
                  Next →
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submitLot} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit for Approval'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <DevFooter screenNum={6} screenName="Seller Portal" subLabel="Dashboard & Lot Wizard" />
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    width: '90%', maxWidth: 640, maxHeight: '90vh',
    background: '#16261F', borderRadius: 12,
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,.4)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '20px 24px 16px',
  },
};
