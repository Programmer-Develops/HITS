import { ShieldCheck, Info, Database, Eye, Lock, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Privacy() {
  const { t, lang } = useLanguage();

  const sections =
    lang === 'hi'
      ? [
          {
            Icon: Info,
            title: '1. परिचय',
            body: 'HITS स्वच्छता निगरानी प्रणाली दिल्ली सरकारी विद्यालयों में स्वच्छता और रखरखाव की निगरानी के लिए बनाई गई है। हम सफ़ाई कर्मचारियों और विद्यालय प्रशासकों की गोपनीयता की सुरक्षा के लिए प्रतिबद्ध हैं।'
          },
          {
            Icon: Database,
            title: '2. हम कौन सा डेटा एकत्र करते हैं',
            body: 'प्रणाली के संचालन के लिए केवल न्यूनतम आवश्यक जानकारी एकत्र की जाती है:',
            bullets: [
              'पंजीकृत सफ़ाई कर्मचारियों के फ़ोन नंबर।',
              'कर्मचारियों द्वारा WhatsApp पर भेजी गई सफ़ाई प्रमाण फ़ोटो।',
              'तिथि, समय और शौचालय ब्लॉक स्थान का रिकॉर्ड।'
            ]
          },
          {
            Icon: Eye,
            title: '3. डेटा का उपयोग कैसे होता है',
            body: 'एकत्र किया गया डेटा केवल विद्यालय स्वच्छता लॉग रखने, प्रधानाचार्य डैशबोर्ड को रीयल-टाइम में अपडेट करने और आंतरिक स्वच्छता रिपोर्ट तैयार करने के लिए उपयोग किया जाता है।'
          },
          {
            Icon: Lock,
            title: '4. डेटा सुरक्षा',
            body: 'सभी फ़ोटो और रिकॉर्ड एन्क्रिप्टेड क्लाउड डेटाबेस में सुरक्षित रूप से संग्रहीत रहते हैं। हम किसी भी तीसरे पक्ष या व्यावसायिक संस्था को व्यक्तिगत डेटा साझा या विक्रय नहीं करते।'
          },
          {
            Icon: Mail,
            title: '5. संपर्क करें',
            body: 'HITS स्वच्छता प्रणाली की गोपनीयता से संबंधित किसी भी प्रश्न के लिए संपर्क करें: ',
            email: 'shantanupandya3@gmail.com'
          }
        ]
      : [
          {
            Icon: Info,
            title: '1. Introduction',
            body: 'HITS Sanitation Bot ("we", "our") is designed exclusively for monitoring school cleanliness and hygiene management in Delhi Government Schools. We are committed to protecting the privacy of sanitation staff and school administrators.'
          },
          {
            Icon: Database,
            title: '2. Data We Collect',
            body: 'We collect only the minimum necessary data to function:',
            bullets: [
              'Phone numbers of registered sanitation workers.',
              'Cleanliness proof photos sent by staff via WhatsApp.',
              'Timestamps and toilet block location logs.'
            ]
          },
          {
            Icon: Eye,
            title: '3. How We Use Data',
            body: 'Data is used solely for maintaining school hygiene logs, updating real-time admin dashboards for Heads of School (Principals), and generating internal cleanliness compliance reports.'
          },
          {
            Icon: Lock,
            title: '4. Data Protection',
            body: 'Photos and records are securely stored in encrypted cloud databases. We never share, sell, or disclose personal data to third parties or commercial entities.'
          },
          {
            Icon: Mail,
            title: '5. Contact Us',
            body: 'For privacy inquiries regarding HITS Sanitation System, contact: ',
            email: 'shantanupandya3@gmail.com'
          }
        ];

  return (
    <div className="page">
      <div className="privacy-wrap">
        <div className="page-header privacy-header">
          <div className="page-title-row">
            <span className="title-icon-badge">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h1 className="page-title">{t.privacyTitle}</h1>
              <p className="page-sub">{t.privacyUpdated}</p>
            </div>
          </div>
        </div>

        <div className="info-card">
          {sections.map(({ Icon, title, body, bullets, email }) => (
            <section key={title} className="privacy-section">
              <h2 className="privacy-heading">
                <Icon size={16} aria-hidden="true" />
                <span>{title}</span>
              </h2>
              <p className="privacy-body">
                {body}
                {email && (
                  <a href={`mailto:${email}`} className="privacy-email">
                    {email}
                  </a>
                )}
              </p>
              {bullets && (
                <ul className="privacy-bullets">
                  {bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
