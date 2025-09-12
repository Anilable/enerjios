exports.id=3785,exports.ids=[3785],exports.modules={21738:(a,b,c)=>{"use strict";c.d(b,{s:()=>d});class d{constructor(){this.apiUrl=process.env.WHATSAPP_API_URL||"",this.apiKey=process.env.WHATSAPP_API_KEY||""}formatCurrency(a){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:2}).format(a)}formatDate(a){return new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(a)}formatPhoneNumber(a){let b=a.replace(/\D/g,"");return b.startsWith("0")?b="90"+b.substring(1):b.startsWith("90")||(b="90"+b),b}async sendQuoteMessage(a,b){if(!this.apiUrl||!this.apiKey)return console.warn("WhatsApp API not configured"),!1;let c=this.formatPhoneNumber(a),d=`
🌞 *${b.companyName}*
*G\xfcneş Enerji Sistemi Teklifi*

Merhaba ${b.customerName},

G\xfcneş enerji sistemi kurulum talebiniz i\xe7in hazırladığımız teklif hazır! 

📋 *Teklif Detayları:*
• Teklif No: ${b.quoteNumber}
• Toplam Tutar: ${this.formatCurrency(b.total)}
• Ge\xe7erlilik: ${this.formatDate(b.validUntil)} tarihine kadar

${b.message?`
💬 *\xd6zel Mesaj:*
${b.message}
`:""}

📄 *Detaylı teklifi g\xf6r\xfcnt\xfclemek ve onaylamak i\xe7in:*
${b.viewUrl}

⚡ G\xfcneş enerjisiyle tasarruf etmenin tam zamanı!

---
Bu mesaj otomatik olarak g\xf6nderilmiştir.
${b.companyName} - G\xfcneş Enerji \xc7\xf6z\xfcmleri
`.trim();try{let a=await fetch(this.apiUrl,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({phone:c,message:d,type:"text"})});if(a.ok)return console.log(`WhatsApp message sent successfully to ${c}`),!0;return console.error("WhatsApp API error:",await a.text()),!1}catch(a){return console.error("WhatsApp sending error:",a),!1}}async sendQuoteStatusUpdate(a,b,c,d){if(!this.apiUrl||!this.apiKey)return!1;let e=this.formatPhoneNumber(a),f="";switch(d){case"approved":f=`
🎉 *Teklif Onayı Alındı!*

Merhaba ${b},

${c} numaralı teklifiniz onaylanmıştır. Teşekk\xfcr ederiz!

Proje başlatma s\xfcrecini hızla başlatacağız. Ekibimiz size en kısa s\xfcrede detayları iletecektir.

G\xfcneş enerjisiyle tasarruflu g\xfcnlere hoş geldiniz! ☀️
        `.trim();break;case"rejected":f=`
📋 *Teklif Geri Bildirimi*

Merhaba ${b},

${c} numaralı teklifle ilgili geri bildiriminizi aldık.

Sizin i\xe7in daha uygun \xe7\xf6z\xfcmler geliştirebiliriz. L\xfctfen bizimle iletişime ge\xe7in.

Teşekk\xfcr ederiz.
        `.trim()}if(!f)return!1;try{return(await fetch(this.apiUrl,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({phone:e,message:f,type:"text"})})).ok}catch(a){return console.error("WhatsApp status update error:",a),!1}}async testConnection(){if(!this.apiUrl||!this.apiKey)return!1;try{return(await fetch(`${this.apiUrl}/health`,{method:"GET",headers:{Authorization:`Bearer ${this.apiKey}`}})).ok}catch(a){return console.error("WhatsApp connection test failed:",a),!1}}}},33119:(a,b,c)=>{"use strict";c.d(b,{g:()=>g});var d=c(52731);class e{static formatDate(a){return new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(a)}static formatCurrency(a){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:2}).format(a)}static getQuoteDeliveryTemplate(a){let{quote:b,customerName:c,companyName:d,viewUrl:e}=a,f=`${d} - Solar Enerji Sistemi Teklifi #${b.quoteNumber}`;return{subject:f,html:`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solar Enerji Sistemi Teklifi</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f39c12, #e67e22);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 0 0 8px 8px;
      padding: 30px;
    }
    .quote-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #f39c12;
    }
    .cta-button {
      background: #27ae60;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .validity-notice {
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 10px;
      border-radius: 5px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌞 Solar Enerji Sistemi Teklifi</h1>
    <p>G\xfcneş Enerjisiyle Geleceğe Yatırım</p>
  </div>
  
  <div class="content">
    <h2>Sayın ${c},</h2>
    
    <p>
      <strong>${d}</strong> olarak, g\xfcneş enerji sistemi kurulum talebiniz i\xe7in hazırladığımız 
      detaylı teklifimizi sunuyoruz. Ekibimiz, sizin i\xe7in en uygun \xe7\xf6z\xfcm\xfc geliştirmek adına 
      kapsamlı bir analiz ger\xe7ekleştirmiştir.
    </p>

    <div class="quote-summary">
      <h3>📋 Teklif \xd6zeti</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Teklif No:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${b.quoteNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Toplam Tutar:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #27ae60; font-weight: bold;">
            ${this.formatCurrency(b.total)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Teklif Tarihi:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${this.formatDate(b.createdAt)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Ge\xe7erlilik Tarihi:</strong></td>
          <td style="padding: 8px 0;">${this.formatDate(b.validUntil)}</td>
        </tr>
      </table>
    </div>

    <div class="validity-notice">
      <strong>⚠️ \xd6nemli:</strong> Bu teklif ${this.formatDate(b.validUntil)} tarihine kadar ge\xe7erlidir.
      Belirlenen s\xfcre i\xe7erisinde değerlendirmenizi rica ederiz.
    </div>

    <h3>🎯 Neden Bizimle \xc7alışmalısınız?</h3>
    <ul>
      <li>✅ <strong>Uzman Ekip:</strong> Alanında deneyimli m\xfchendis kadrosu</li>
      <li>✅ <strong>Kaliteli \xdcr\xfcnler:</strong> Uluslararası standartlarda ekipmanlar</li>
      <li>✅ <strong>Garanti:</strong> Kapsamlı \xfcr\xfcn ve iş\xe7ilik garantisi</li>
      <li>✅ <strong>Hızlı Kurulum:</strong> Profesyonel kurulum ekibi</li>
      <li>✅ <strong>Teknik Destek:</strong> 7/24 m\xfcşteri desteği</li>
    </ul>

    <div style="text-align: center;">
      <a href="${e}" class="cta-button">
        📄 Detaylı Teklifi G\xf6r\xfcnt\xfcle ve Onayla
      </a>
    </div>

    <h3>📞 İletişim</h3>
    <p>
      Teklif hakkında sorularınız varsa veya detaylı bilgi almak istiyorsanız, 
      bizimle iletişime ge\xe7mekten \xe7ekinmeyin:
    </p>
    <ul>
      <li>📧 Email: ${b.createdBy.email}</li>
      ${b.createdBy.phone?`<li>📱 Telefon: ${b.createdBy.phone}</li>`:""}
    </ul>

    <p>
      G\xfcneş enerjisi yatırımınızda size rehberlik etmekten mutluluk duyarız. 
      S\xfcrd\xfcr\xfclebilir bir gelecek i\xe7in birlikte \xe7alışalım!
    </p>

    <p style="margin-top: 30px;">
      Saygılarımızla,<br>
      <strong>${d}</strong><br>
      <em>G\xfcneş Enerji \xc7\xf6z\xfcmleri</em>
    </p>
  </div>

  <div class="footer">
    <p>
      Bu e-posta otomatik olarak g\xf6nderilmiştir. L\xfctfen bu e-postaya yanıt vermeyiniz.<br>
      Sorularınız i\xe7in yukarıdaki iletişim bilgilerini kullanınız.
    </p>
  </div>
</body>
</html>`,text:`
${d} - Solar Enerji Sistemi Teklifi #${b.quoteNumber}

Sayın ${c},

${d} olarak, g\xfcneş enerji sistemi kurulum talebiniz i\xe7in hazırladığımız detaylı teklifimizi sunuyoruz.

Teklif \xd6zeti:
- Teklif No: ${b.quoteNumber}
- Toplam Tutar: ${this.formatCurrency(b.total)}
- Teklif Tarihi: ${this.formatDate(b.createdAt)}
- Ge\xe7erlilik Tarihi: ${this.formatDate(b.validUntil)}

\xd6NEMLI: Bu teklif ${this.formatDate(b.validUntil)} tarihine kadar ge\xe7erlidir.

Detaylı teklifi g\xf6r\xfcnt\xfclemek ve onaylamak i\xe7in: ${e}

İletişim:
- Email: ${b.createdBy.email}
${b.createdBy.phone?`- Telefon: ${b.createdBy.phone}`:""}

Saygılarımızla,
${d}
G\xfcneş Enerji \xc7\xf6z\xfcmleri
`}}static getQuoteViewedNotificationTemplate(a){let{quote:b,customerName:c}=a,d=`Teklif G\xf6r\xfcnt\xfclendi - ${c} (#${b.quoteNumber})`;return{subject:d,html:`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .notification { background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; }
  </style>
</head>
<body>
  <div class="notification">
    <h2>👁️ Teklif G\xf6r\xfcnt\xfclendi</h2>
    <p><strong>${c}</strong> adlı m\xfcşteri <strong>#${b.quoteNumber}</strong> numaralı teklifi g\xf6r\xfcnt\xfcledi.</p>
    <p><strong>G\xf6r\xfcnt\xfclenme Zamanı:</strong> ${this.formatDate(b.viewedAt)}</p>
    <p>M\xfcşterinin kararını bekleyebilir veya takip i\xe7in iletişime ge\xe7ebilirsiniz.</p>
  </div>
</body>
</html>`,text:`Teklif G\xf6r\xfcnt\xfclendi - ${c} (#${b.quoteNumber})

${c} adlı m\xfcşteri #${b.quoteNumber} numaralı teklifi g\xf6r\xfcnt\xfcledi.
G\xf6r\xfcnt\xfclenme Zamanı: ${this.formatDate(b.viewedAt)}`}}static getQuoteApprovedNotificationTemplate(a){let{quote:b,customerName:c}=a,d=`🎉 Teklif Onaylandı - ${c} (#${b.quoteNumber})`;return{subject:d,html:`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .success { background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; }
  </style>
</head>
<body>
  <div class="success">
    <h2>🎉 Teklif Onaylandı!</h2>
    <p><strong>${c}</strong> adlı m\xfcşteri <strong>#${b.quoteNumber}</strong> numaralı teklifi onayladı.</p>
    <p><strong>Onay Zamanı:</strong> ${this.formatDate(b.approvedAt)}</p>
    <p><strong>Toplam Tutar:</strong> ${this.formatCurrency(b.total)}</p>
    <p>Projeyi başlatmak i\xe7in gerekli adımları atabilirsiniz.</p>
  </div>
</body>
</html>`,text:`Teklif Onaylandı! - ${c} (#${b.quoteNumber})

${c} adlı m\xfcşteri #${b.quoteNumber} numaralı teklifi onayladı.
Onay Zamanı: ${this.formatDate(b.approvedAt)}
Toplam Tutar: ${this.formatCurrency(b.total)}`}}static getQuoteRejectedNotificationTemplate(a){let{quote:b,customerName:c}=a,d=`❌ Teklif Reddedildi - ${c} (#${b.quoteNumber})`;return{subject:d,html:`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .danger { background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; }
  </style>
</head>
<body>
  <div class="danger">
    <h2>❌ Teklif Reddedildi</h2>
    <p><strong>${c}</strong> adlı m\xfcşteri <strong>#${b.quoteNumber}</strong> numaralı teklifi reddetti.</p>
    <p><strong>Red Zamanı:</strong> ${this.formatDate(b.rejectedAt)}</p>
    ${b.customerComments?`<p><strong>M\xfcşteri Yorumu:</strong> ${b.customerComments}</p>`:""}
    <p>M\xfcşteri ile iletişime ge\xe7erek geri bildirim alabilirsiniz.</p>
  </div>
</body>
</html>`,text:`Teklif Reddedildi - ${c} (#${b.quoteNumber})

${c} adlı m\xfcşteri #${b.quoteNumber} numaralı teklifi reddetti.
Red Zamanı: ${this.formatDate(b.rejectedAt)}
${b.customerComments?`M\xfcşteri Yorumu: ${b.customerComments}`:""}`}}static getQuoteExpiryWarningTemplate(a){let{quote:b,customerName:c}=a,d=`⏰ Teklif S\xfcresi Bitiyor - ${c} (#${b.quoteNumber})`;return{subject:d,html:`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .warning { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; }
  </style>
</head>
<body>
  <div class="warning">
    <h2>⏰ Teklif S\xfcresi Bitiyor</h2>
    <p><strong>#${b.quoteNumber}</strong> numaralı teklif yakında sona erecek.</p>
    <p><strong>M\xfcşteri:</strong> ${c}</p>
    <p><strong>Bitiş Tarihi:</strong> ${this.formatDate(b.validUntil)}</p>
    <p>M\xfcşteri ile iletişime ge\xe7erek teklif s\xfcresini hatırlatabilirsiniz.</p>
  </div>
</body>
</html>`,text:`Teklif S\xfcresi Bitiyor - ${c} (#${b.quoteNumber})

#${b.quoteNumber} numaralı teklif yakında sona erecek.
M\xfcşteri: ${c}
Bitiş Tarihi: ${this.formatDate(b.validUntil)}`}}}class f{constructor(){let a={host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASSWORD||""}};this.transporter=d.createTransport(a)}async sendEmail(a){try{let b=await this.transporter.sendMail({from:`"Trakya Solar" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:a.to,subject:a.subject,html:a.html,text:a.text,attachments:a.attachments||[]});return console.log("Email sent successfully:",b.messageId),!0}catch(a){return console.error("Email sending failed:",a),!1}}async sendQuoteDeliveryEmail(a,b,c,d,f){let g=`${process.env.NEXT_PUBLIC_APP_URL}/quotes/public/${a.deliveryToken}`,h=e.getQuoteDeliveryTemplate({quote:a,customerName:c,companyName:d,viewUrl:g}),i=[];return f&&i.push({filename:`Teklif-${a.quoteNumber}.pdf`,path:f,contentType:"application/pdf"}),this.sendEmail({to:b,subject:h.subject,html:h.html,text:h.text,attachments:i})}async sendQuoteStatusNotification(a,b,c,d){let f,g={quote:a,customerName:b,companyName:c,viewUrl:""};switch(d){case"viewed":f=e.getQuoteViewedNotificationTemplate(g);break;case"approved":f=e.getQuoteApprovedNotificationTemplate(g);break;case"rejected":f=e.getQuoteRejectedNotificationTemplate(g)}return this.sendEmail({to:a.createdBy.email,subject:f.subject,html:f.html,text:f.text})}async sendQuoteExpiryWarning(a,b,c){let d=e.getQuoteExpiryWarningTemplate({quote:a,customerName:b,companyName:c,viewUrl:""});return this.sendEmail({to:a.createdBy.email,subject:d.subject,html:d.html,text:d.text})}async testConnection(){try{return await this.transporter.verify(),!0}catch(a){return console.error("SMTP connection test failed:",a),!1}}}let g=new f},78335:()=>{},96487:()=>{},96798:(a,b,c)=>{"use strict";c.d(b,{z:()=>e});var d=c(96330);let e=globalThis.prisma??new d.PrismaClient({log:["query"]})}};