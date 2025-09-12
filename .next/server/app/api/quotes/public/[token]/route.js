(()=>{var a={};a.id=1853,a.ids=[1853],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},371:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{GET:()=>y});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(96798),w=c(96330),x=c(33119);async function y(a,{params:b}){try{let{token:c}=await b;if(!c)return u.NextResponse.json({error:"Token gerekli"},{status:400});let d=await v.z.quote.findUnique({where:{deliveryToken:c},include:{project:!0,customer:{include:{user:!0}},company:!0,createdBy:!0,items:{include:{product:!0}}}});if(!d)return u.NextResponse.json({error:"Teklif bulunamadı veya ge\xe7ersiz token"},{status:404});let e=new Date;if(d.validUntil<e)return d.status!==w.QuoteStatus.EXPIRED&&await v.z.quote.update({where:{id:d.id},data:{status:w.QuoteStatus.EXPIRED,expiredAt:e}}),u.NextResponse.json({error:"Teklif s\xfcresi dolmuş",expired:!0},{status:410});if(d.status===w.QuoteStatus.SENT){let b=a.headers.get("user-agent")||"",c=a.headers.get("x-forwarded-for"),f=c?.split(",")[0]||a.headers.get("x-real-ip")||"unknown";await v.z.quote.update({where:{id:d.id},data:{status:w.QuoteStatus.VIEWED,viewedAt:e,customerIP:f,customerAgent:b}});let g=d.customer?.companyName||`${d.customer?.firstName||""} ${d.customer?.lastName||""}`.trim()||"M\xfcşteri",h=d.company?.name||process.env.COMPANY_NAME||"Trakya Solar";try{await x.g.sendQuoteStatusNotification(d,g,h,"viewed")}catch(a){console.error("Failed to send view notification:",a)}}return u.NextResponse.json({id:d.id,quoteNumber:d.quoteNumber,status:d.status,subtotal:d.subtotal,tax:d.tax,discount:d.discount,total:d.total,validUntil:d.validUntil,terms:d.terms,notes:d.notes,pdfUrl:d.pdfUrl,sentAt:d.sentAt,viewedAt:d.viewedAt,project:{name:d.project.name,type:d.project.type,capacity:d.project.capacity,estimatedCost:d.project.estimatedCost},company:d.company?{name:d.company.name,phone:d.company.phone,address:d.company.address,city:d.company.city,logo:d.company.logo,website:d.company.website}:null,createdBy:{name:d.createdBy.name,email:d.createdBy.email,phone:d.createdBy.phone},customer:d.customer?{type:d.customer.type,firstName:d.customer.firstName,lastName:d.customer.lastName,companyName:d.customer.companyName,phone:d.customer.phone}:null,items:d.items.map(a=>({id:a.id,description:a.description,quantity:a.quantity,unitPrice:a.unitPrice,total:a.total,product:{name:a.product.name,brand:a.product.brand,model:a.product.model,type:a.product.type,power:a.product.power,warranty:a.product.warranty}}))})}catch(a){return console.error("Public quote fetch error:",a),u.NextResponse.json({error:"Sunucu hatası"},{status:500})}}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/quotes/public/[token]/route",pathname:"/api/quotes/public/[token]",filename:"route",bundlePath:"app/api/quotes/public/[token]/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\trakya-solar\\src\\app\\api\\quotes\\public\\[token]\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){var d;let e="/api/quotes/public/[token]/route";"/index"===e&&(e="/");let g=await z.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||z.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===z.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>z.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>z.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||b instanceof s.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33119:(a,b,c)=>{"use strict";c.d(b,{g:()=>g});var d=c(52731);class e{static formatDate(a){return new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(a)}static formatCurrency(a){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:2}).format(a)}static getQuoteDeliveryTemplate(a){let{quote:b,customerName:c,companyName:d,viewUrl:e}=a,f=`${d} - Solar Enerji Sistemi Teklifi #${b.quoteNumber}`;return{subject:f,html:`
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
Bitiş Tarihi: ${this.formatDate(b.validUntil)}`}}}class f{constructor(){let a={host:process.env.SMTP_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASSWORD||""}};this.transporter=d.createTransport(a)}async sendEmail(a){try{let b=await this.transporter.sendMail({from:`"Trakya Solar" <${process.env.SMTP_FROM||process.env.SMTP_USER}>`,to:a.to,subject:a.subject,html:a.html,text:a.text,attachments:a.attachments||[]});return console.log("Email sent successfully:",b.messageId),!0}catch(a){return console.error("Email sending failed:",a),!1}}async sendQuoteDeliveryEmail(a,b,c,d,f){let g=`${process.env.NEXT_PUBLIC_APP_URL}/quotes/public/${a.deliveryToken}`,h=e.getQuoteDeliveryTemplate({quote:a,customerName:c,companyName:d,viewUrl:g}),i=[];return f&&i.push({filename:`Teklif-${a.quoteNumber}.pdf`,path:f,contentType:"application/pdf"}),this.sendEmail({to:b,subject:h.subject,html:h.html,text:h.text,attachments:i})}async sendQuoteStatusNotification(a,b,c,d){let f,g={quote:a,customerName:b,companyName:c,viewUrl:""};switch(d){case"viewed":f=e.getQuoteViewedNotificationTemplate(g);break;case"approved":f=e.getQuoteApprovedNotificationTemplate(g);break;case"rejected":f=e.getQuoteRejectedNotificationTemplate(g)}return this.sendEmail({to:a.createdBy.email,subject:f.subject,html:f.html,text:f.text})}async sendQuoteExpiryWarning(a,b,c){let d=e.getQuoteExpiryWarningTemplate({quote:a,customerName:b,companyName:c,viewUrl:""});return this.sendEmail({to:a.createdBy.email,subject:d.subject,html:d.html,text:d.text})}async testConnection(){try{return await this.transporter.verify(),!0}catch(a){return console.error("SMTP connection test failed:",a),!1}}}let g=new f},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96330:a=>{"use strict";a.exports=require("@prisma/client")},96487:()=>{},96798:(a,b,c)=>{"use strict";c.d(b,{z:()=>e});var d=c(96330);let e=globalThis.prisma??new d.PrismaClient({log:["query"]})}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4996,1692,5112],()=>b(b.s=371));module.exports=c})();