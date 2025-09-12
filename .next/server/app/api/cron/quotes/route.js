(()=>{var a={};a.id=6390,a.ids=[6390],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33119:(a,b,c)=>{"use strict";c.d(b,{g:()=>g});var d=c(52731);class e{static formatDate(a){return new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(a)}static formatCurrency(a){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:2}).format(a)}static getQuoteDeliveryTemplate(a){let{quote:b,customerName:c,companyName:d,viewUrl:e}=a,f=`${d} - Solar Enerji Sistemi Teklifi #${b.quoteNumber}`;return{subject:f,html:`
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
Bitiş Tarihi: ${this.formatDate(b.validUntil)}`}}}class f{constructor(){let a={host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASSWORD||""}};this.transporter=d.createTransport(a)}async sendEmail(a){try{let b=await this.transporter.sendMail({from:`"Trakya Solar" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:a.to,subject:a.subject,html:a.html,text:a.text,attachments:a.attachments||[]});return console.log("Email sent successfully:",b.messageId),!0}catch(a){return console.error("Email sending failed:",a),!1}}async sendQuoteDeliveryEmail(a,b,c,d,f){let g=`${process.env.NEXT_PUBLIC_APP_URL}/quotes/public/${a.deliveryToken}`,h=e.getQuoteDeliveryTemplate({quote:a,customerName:c,companyName:d,viewUrl:g}),i=[];return f&&i.push({filename:`Teklif-${a.quoteNumber}.pdf`,path:f,contentType:"application/pdf"}),this.sendEmail({to:b,subject:h.subject,html:h.html,text:h.text,attachments:i})}async sendQuoteStatusNotification(a,b,c,d){let f,g={quote:a,customerName:b,companyName:c,viewUrl:""};switch(d){case"viewed":f=e.getQuoteViewedNotificationTemplate(g);break;case"approved":f=e.getQuoteApprovedNotificationTemplate(g);break;case"rejected":f=e.getQuoteRejectedNotificationTemplate(g)}return this.sendEmail({to:a.createdBy.email,subject:f.subject,html:f.html,text:f.text})}async sendQuoteExpiryWarning(a,b,c){let d=e.getQuoteExpiryWarningTemplate({quote:a,customerName:b,companyName:c,viewUrl:""});return this.sendEmail({to:a.createdBy.email,subject:d.subject,html:d.html,text:d.text})}async testConnection(){try{return await this.transporter.verify(),!0}catch(a){return console.error("SMTP connection test failed:",a),!1}}}let g=new f},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},34943:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>G,patchFetch:()=>F,routeModule:()=>B,serverHooks:()=>E,workAsyncStorage:()=>C,workUnitAsyncStorage:()=>D});var d={};c.r(d),c.d(d,{GET:()=>z,POST:()=>A});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(96798),w=c(33119),x=c(96330);class y{static async checkExpiredQuotes(){try{let a=new Date,b=await v.z.quote.findMany({where:{validUntil:{lt:a},status:{in:["SENT","VIEWED"]}},include:{customer:{include:{user:!0}},createdBy:!0,company:!0}});for(let c of(console.log(`Found ${b.length} expired quotes to update`),b))await v.z.quote.update({where:{id:c.id},data:{status:x.QuoteStatus.EXPIRED,expiredAt:a}}),await v.z.notification.create({data:{userId:c.createdById,type:"SYSTEM_ALERT",title:"Teklif S\xfcresi Doldu",message:`${c.quoteNumber} numaralı teklif s\xfcresi doldu.`,actionUrl:`/dashboard/quotes/${c.id}`}}),console.log(`Updated quote ${c.quoteNumber} to expired status`)}catch(a){console.error("Error checking expired quotes:",a)}}static async sendExpiryWarnings(){try{let a=new Date;a.setDate(a.getDate()+2);let b=await v.z.quote.findMany({where:{validUntil:{gte:new Date,lte:a},status:{in:["SENT","VIEWED"]},updatedAt:{lt:new Date(Date.now()-864e5)}},include:{customer:{include:{user:!0}},createdBy:!0,company:!0}});for(let a of(console.log(`Found ${b.length} quotes expiring soon`),b)){let b=a.customer?.companyName||`${a.customer?.firstName||""} ${a.customer?.lastName||""}`.trim()||"M\xfcşteri",c=a.company?.name||process.env.COMPANY_NAME||"Trakya Solar";try{await w.g.sendQuoteExpiryWarning(a,b,c),await v.z.notification.create({data:{userId:a.createdById,type:"SYSTEM_ALERT",title:"Teklif S\xfcresi Yakında Doluyor",message:`${a.quoteNumber} numaralı teklif ${new Date(a.validUntil).toLocaleDateString("tr-TR")} tarihinde sona erecek.`,actionUrl:`/dashboard/quotes/${a.id}`}}),console.log(`Sent expiry warning for quote ${a.quoteNumber}`)}catch(b){console.error(`Failed to send expiry warning for quote ${a.quoteNumber}:`,b)}}}catch(a){console.error("Error sending expiry warnings:",a)}}static async cleanupOldNotifications(){try{let a=new Date;a.setDate(a.getDate()-30);let b=await v.z.notification.deleteMany({where:{createdAt:{lt:a},read:!0}});console.log(`Cleaned up ${b.count} old notifications`)}catch(a){console.error("Error cleaning up old notifications:",a)}}static async generateQuoteAnalytics(){try{let a=new Date;a.setDate(a.getDate()-30);let b=await v.z.quote.groupBy({by:["status"],where:{createdAt:{gte:a}},_count:{id:!0},_sum:{total:!0}}),c=await v.z.quote.count({where:{createdAt:{gte:a}}}),d=await v.z.quote.count({where:{createdAt:{gte:a},status:"APPROVED"}}),e=c>0?(d/c*100).toFixed(2):"0";console.log("Quote Analytics (Last 30 Days):"),console.log(`Total Quotes: ${c}`),console.log(`Approved Quotes: ${d}`),console.log(`Conversion Rate: ${e}%`),console.log("Status Breakdown:",b)}catch(a){console.error("Error generating quote analytics:",a)}}static async runScheduledTasks(){console.log("Running scheduled quote tasks..."),await this.checkExpiredQuotes(),await this.sendExpiryWarnings(),await this.cleanupOldNotifications(),await this.generateQuoteAnalytics(),console.log("Scheduled quote tasks completed")}static async sendPendingQuoteReminders(){try{let a=new Date;a.setDate(a.getDate()-7);let b=await v.z.quote.findMany({where:{status:"VIEWED",viewedAt:{lte:a},validUntil:{gte:new Date}},include:{customer:{include:{user:!0}},createdBy:!0,company:!0}});for(let a of(console.log(`Found ${b.length} quotes with no activity for 7+ days`),b))await v.z.notification.create({data:{userId:a.createdById,type:"SYSTEM_ALERT",title:"Teklif Takip Gerekli",message:`${a.quoteNumber} numaralı teklif 7 g\xfcnd\xfcr beklemede. M\xfcşteri ile iletişime ge\xe7meyi d\xfcş\xfcn\xfcn.`,actionUrl:`/dashboard/quotes/${a.id}`}}),console.log(`Created reminder for quote ${a.quoteNumber}`)}catch(a){console.error("Error sending pending quote reminders:",a)}}}async function z(a){try{let b=a.headers.get("authorization"),c=process.env.CRON_SECRET;if(c&&b!==`Bearer ${c}`)return u.NextResponse.json({error:"Unauthorized"},{status:401});return console.log("Starting scheduled quote tasks..."),await y.runScheduledTasks(),u.NextResponse.json({success:!0,message:"Scheduled tasks completed successfully",timestamp:new Date().toISOString()})}catch(a){return console.error("Error running scheduled tasks:",a),u.NextResponse.json({error:"Failed to run scheduled tasks",details:a instanceof Error?a.message:"Unknown error"},{status:500})}}async function A(a){try{let{task:b}=await a.json();switch(b){case"expired":await y.checkExpiredQuotes();break;case"warnings":await y.sendExpiryWarnings();break;case"reminders":await y.sendPendingQuoteReminders();break;case"cleanup":await y.cleanupOldNotifications();break;case"analytics":await y.generateQuoteAnalytics();break;default:await y.runScheduledTasks()}return u.NextResponse.json({success:!0,message:`Task '${b}' completed successfully`,timestamp:new Date().toISOString()})}catch(a){return console.error("Error running scheduled task:",a),u.NextResponse.json({error:"Failed to run scheduled task",details:a instanceof Error?a.message:"Unknown error"},{status:500})}}let B=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/cron/quotes/route",pathname:"/api/cron/quotes",filename:"route",bundlePath:"app/api/cron/quotes/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\trakya-solar\\src\\app\\api\\cron\\quotes\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:C,workUnitAsyncStorage:D,serverHooks:E}=B;function F(){return(0,g.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:D})}async function G(a,b,c){var d;let e="/api/cron/quotes/route";"/index"===e&&(e="/");let g=await B.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||B.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===B.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>B.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>B.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await B.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await B.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||b instanceof s.NoFallbackError||await B.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96330:a=>{"use strict";a.exports=require("@prisma/client")},96487:()=>{},96798:(a,b,c)=>{"use strict";c.d(b,{z:()=>e});var d=c(96330);let e=globalThis.prisma??new d.PrismaClient({log:["query"]})}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4996,1692,5112],()=>b(b.s=34943));module.exports=c})();