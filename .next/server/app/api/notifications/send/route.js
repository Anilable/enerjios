"use strict";(()=>{var a={};a.id=455,a.ids=[455],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11723:a=>{a.exports=require("querystring")},12412:a=>{a.exports=require("assert")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},28354:a=>{a.exports=require("util")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33420:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{handler:()=>x,patchFetch:()=>w,routeModule:()=>y,serverHooks:()=>B,workAsyncStorage:()=>z,workUnitAsyncStorage:()=>A});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(55186),v=a([u]);u=(v.then?(await v)():v)[0];let y=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/notifications/send/route",pathname:"/api/notifications/send",filename:"route",bundlePath:"app/api/notifications/send/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\trakya-solar\\src\\app\\api\\notifications\\send\\route.ts",nextConfigOutput:"standalone",userland:u}),{workAsyncStorage:z,workUnitAsyncStorage:A,serverHooks:B}=y;function w(){return(0,g.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:A})}async function x(a,b,c){var d;let e="/api/notifications/send/route";"/index"===e&&(e="/");let g=await y.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!x){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||y.isDev||x||(G=D,G="/index"===G?"/":G);let H=!0===y.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>y.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>y.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await y.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await y.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||b instanceof s.NoFallbackError||await y.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}d()}catch(a){d(a)}})},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},52963:(a,b,c)=>{Object.defineProperty(b,"__esModule",{value:!0});var d={};Object.defineProperty(b,"default",{enumerable:!0,get:function(){return f.default}});var e=c(96434);Object.keys(e).forEach(function(a){!("default"===a||"__esModule"===a||Object.prototype.hasOwnProperty.call(d,a))&&(a in b&&b[a]===e[a]||Object.defineProperty(b,a,{enumerable:!0,get:function(){return e[a]}}))});var f=function(a,b){if(a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=g(b);if(c&&c.has(a))return c.get(a);var d={},e=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var f in a)if("default"!==f&&Object.prototype.hasOwnProperty.call(a,f)){var h=e?Object.getOwnPropertyDescriptor(a,f):null;h&&(h.get||h.set)?Object.defineProperty(d,f,h):d[f]=a[f]}return d.default=a,c&&c.set(a,d),d}(c(1093));function g(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(g=function(a){return a?c:b})(a)}Object.keys(f).forEach(function(a){!("default"===a||"__esModule"===a||Object.prototype.hasOwnProperty.call(d,a))&&(a in b&&b[a]===f[a]||Object.defineProperty(b,a,{enumerable:!0,get:function(){return f[a]}}))})},55186:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{GET:()=>m,POST:()=>l});var e=c(10641),f=c(52963),g=c(67360),h=c(60140),i=c(37947),j=c(82035),k=a([g]);g=(k.then?(await k)():k)[0];let n=h.Ik({type:h.k5(["project_created","quote_ready","quote_approved","installation_scheduled","installation_completed","payment_reminder","system_status_update","maintenance_reminder"]),recipient:h.Ik({name:h.Yj(),email:h.Yj().email(),phone:h.Yj().optional(),language:h.k5(["tr","en"]).optional(),preferences:h.Ik({email:h.zM().optional(),sms:h.zM().optional(),whatsapp:h.zM().optional(),push:h.zM().optional()}).optional()}),data:h.g1(h.Yj(),h.bz()),channels:h.YO(h.k5(["email","sms","whatsapp","push"])).optional()}),o=h.Ik({notifications:h.YO(n)});async function l(a){try{if(!await (0,f.getServerSession)(g.N))return e.NextResponse.json({error:"Unauthorized"},{status:401});let b=await a.json();if(b.notifications&&Array.isArray(b.notifications)){let a=o.parse(b),c=[];for(let b of a.notifications)try{let a=await j.F.sendNotification(b.type,b.recipient,b.data,b.channels||["email"]);c.push({recipient:b.recipient.email,success:!0,logs:a})}catch(a){c.push({recipient:b.recipient.email,success:!1,error:a instanceof Error?a.message:"Unknown error"})}let d=c.filter(a=>a.success).length,f=c.filter(a=>!a.success).length;return e.NextResponse.json({success:!0,message:`${d} notification sent successfully, ${f} failed`,results:c,summary:{total:c.length,successful:d,failed:f}})}{let a=n.parse(b),c=await j.F.sendNotification(a.type,a.recipient,a.data,a.channels||["email"]);return e.NextResponse.json({success:!0,message:"Notification sent successfully",logs:c})}}catch(a){if(console.error("Notification send error:",a),a instanceof i.G)return e.NextResponse.json({error:"Invalid request data",details:a.issues},{status:400});return e.NextResponse.json({error:"Failed to send notification"},{status:500})}}async function m(a){try{if(!await (0,f.getServerSession)(g.N))return e.NextResponse.json({error:"Unauthorized"},{status:401});let{searchParams:b}=new URL(a.url),c={type:b.get("type"),channel:b.get("channel")||void 0,status:b.get("status")||void 0,recipient:b.get("recipient")||void 0,dateFrom:b.get("dateFrom")||void 0,dateTo:b.get("dateTo")||void 0},d=j.F.getNotificationLogs(c),h=j.F.getStatistics(c.dateFrom,c.dateTo);return e.NextResponse.json({success:!0,logs:d,statistics:h,totalCount:d.length})}catch(a){return console.error("Failed to get notification logs:",a),e.NextResponse.json({error:"Failed to get notification logs"},{status:500})}}d()}catch(a){d(a)}})},55511:a=>{a.exports=require("crypto")},55591:a=>{a.exports=require("https")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:a=>{a.exports=require("zlib")},79428:a=>{a.exports=require("buffer")},79551:a=>{a.exports=require("url")},81630:a=>{a.exports=require("http")},82035:(a,b,c)=>{c.d(b,{F:()=>f});var d=c(82716);class e{constructor(){this.templates=new Map,this.logs=[],this.initializeDefaultTemplates()}initializeDefaultTemplates(){[{id:"project_created_email",type:"project_created",channel:"email",subject:"G\xfcneş Enerjisi Projeniz Oluşturuldu - {{projectTitle}}",title:"Projeniz Oluşturuldu!",content:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🌞 G\xfcneş Enerjisi Projeniz Hazır!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>3D tasarımcıdan oluşturduğunuz g\xfcneş enerjisi sistemi projeniz başarıyla oluşturuldu ve teknik ekibimiz tarafından değerlendiriliyor.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">📋 Proje Detayları</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Proje ID:</strong> {{projectId}}</li>
                <li><strong>Sistem G\xfcc\xfc:</strong> {{systemSize}} kW</li>
                <li><strong>Tahmini Maliyet:</strong> ₺{{estimatedPrice:format}}</li>
                <li><strong>Oluşturma Tarihi:</strong> {{createdDate}}</li>
              </ul>
            </div>
            
            <p><strong>Sonraki Adımlar:</strong></p>
            <ol>
              <li>Teknik ekibimiz tasarımınızı detaylı olarak inceleyecek</li>
              <li>24-48 saat i\xe7inde size detaylı teklif sunulacak</li>
              <li>Teklifin onaylanması sonrası kurulum planlaması yapılacak</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Projenizi Takip Edin
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Herhangi bir sorunuz varsa bizimle iletişime ge\xe7mekten \xe7ekinmeyin.<br>
              Telefon: +90 284 XXX XX XX<br>
              Email: info@enerjios.com
            </p>
            
            <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Bu email otomatik olarak oluşturulmuştur. L\xfctfen yanıtlamayınız.<br>
              EnerjiOS - G\xfcneş Enerjisi Y\xf6netim Platformu
            </p>
          </div>
        `,variables:["customerName","projectId","projectTitle","systemSize","estimatedPrice","createdDate","dashboardUrl"],isActive:!0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},{id:"project_created_sms",type:"project_created",channel:"sms",title:"Proje Oluşturuldu",content:"Merhaba {{customerName}}! {{systemSize}}kW GES projeniz oluşturuldu. Proje ID: {{projectId}}. 24-48 saat i\xe7inde detaylı teklifimizi alacaksınız. Takip: enerjios.com/proje/{{projectId}}",variables:["customerName","systemSize","projectId"],isActive:!0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},{id:"quote_ready_email",type:"quote_ready",channel:"email",subject:"G\xfcneş Enerjisi Teklifiniz Hazır - {{projectTitle}}",title:"Teklifiniz Hazır!",content:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Teklifiniz Hazır!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>{{projectTitle}} i\xe7in hazırladığımız detaylı teklif hazır. Ekibimiz tasarımınızı inceledi ve size \xf6zel bir \xe7\xf6z\xfcm sunuyor.</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #065f46;">💰 Teklif \xd6zeti</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Sistem G\xfcc\xfc:</strong> {{systemSize}} kW</li>
                <li><strong>Toplam Tutar:</strong> <span style="color: #10b981; font-size: 18px;">₺{{quotedPrice:format}}</span></li>
                <li><strong>Tahmini Geri \xd6deme:</strong> {{paybackPeriod}} yıl</li>
                <li><strong>25 Yıllık Tasarruf:</strong> ₺{{total25YearSavings:format}}</li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Bu Teklif {{validUntil}} tarihine kadar ge\xe7erlidir.</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{quoteUrl}}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                Teklifi G\xf6r\xfcnt\xfcle
              </a>
              <a href="{{dashboardUrl}}" style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Dashboard'a Git
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Teklif hakkında detaylı bilgi almak i\xe7in bizimle iletişime ge\xe7in.<br>
              Telefon: +90 284 XXX XX XX | WhatsApp: +90 5XX XXX XX XX
            </p>
          </div>
        `,variables:["customerName","projectTitle","systemSize","quotedPrice","paybackPeriod","total25YearSavings","validUntil","quoteUrl","dashboardUrl"],isActive:!0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},{id:"quote_approved_email",type:"quote_approved",channel:"email",subject:"Tebrikler! Projeniz Onaylandı - {{projectTitle}}",title:"Projeniz Onaylandı!",content:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🎉 Tebrikler! Projeniz Onaylandı!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>{{projectTitle}} i\xe7in verdiğimiz teklifi onaylıyorsunuz. G\xfcneş enerjisine ge\xe7iş yolculuğunuzda artık aktif adımlarla ilerliyoruz!</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">📅 Sonraki S\xfcre\xe7</h3>
              <ol style="margin: 0;">
                <li><strong>Saha Analizi:</strong> 3-5 iş g\xfcn\xfc i\xe7inde</li>
                <li><strong>Kurulum Planlaması:</strong> Analiz sonrası 2-3 g\xfcn</li>
                <li><strong>Sistem Kurulumu:</strong> 1-3 g\xfcn (sistem b\xfcy\xfckl\xfcğ\xfcne g\xf6re)</li>
                <li><strong>Devreye Alma:</strong> Kurulum sonrası aynı g\xfcn</li>
              </ol>
            </div>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📞 Proje sorumlusu {{projectManager}} sizinle yakında iletişim kuracak.</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{projectTrackingUrl}}" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Projeyi Takip Et
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Bu s\xfcre\xe7te sizlere anlık bilgi vereceğiz. Herhangi bir sorunuz olduğunda bizimle iletişime ge\xe7ebilirsiniz.
            </p>
          </div>
        `,variables:["customerName","projectTitle","projectManager","projectTrackingUrl"],isActive:!0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},{id:"installation_completed_email",type:"installation_completed",channel:"email",subject:"Kurulumunuz Tamamlandı! G\xfcneş Enerjisi Sisteminiz Aktif",title:"Sistem Kurulumu Tamamlandı!",content:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">🎊 Tebrikler! G\xfcneş Enerjisi Sisteminiz Aktif!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>{{completionDate}} tarihinde {{systemSize}} kW g\xfc\xe7 kapasiteli g\xfcneş enerjisi sisteminizin kurulumu başarıyla tamamlandı!</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #065f46;">⚡ Sistem Bilgileri</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Kurulu G\xfc\xe7:</strong> {{systemSize}} kW</li>
                <li><strong>Panel Sayısı:</strong> {{panelCount}} adet</li>
                <li><strong>G\xfcnl\xfck \xdcretim (Ort.):</strong> {{dailyProduction}} kWh</li>
                <li><strong>Aylık \xdcretim (Ort.):</strong> {{monthlyProduction}} kWh</li>
                <li><strong>Yıllık \xdcretim (Ort.):</strong> {{annualProduction}} kWh</li>
              </ul>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Tahmini Aylık Elektrik Tasarrufunuz: ₺{{monthlySavings:format}}</strong></p>
            </div>
            
            <h3>📱 Sistem Takibi</h3>
            <p>Sisteminizin performansını ger\xe7ek zamanlı olarak takip edebilir, \xfcretim verilerini g\xf6r\xfcnt\xfcleyebilirsiniz:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{monitoringUrl}}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                Sistem Takibi
              </a>
              <a href="{{userGuideUrl}}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Kullanım Kılavuzu
              </a>
            </div>
            
            <h3>🛠️ Garanti ve Destek</h3>
            <ul>
              <li><strong>Panel Garantisi:</strong> 25 yıl performans garantisi</li>
              <li><strong>İnverter Garantisi:</strong> 10 yıl \xfcr\xfcn garantisi</li>
              <li><strong>Sistem Garantisi:</strong> 2 yıl kurulum garantisi</li>
              <li><strong>7/24 Teknik Destek:</strong> +90 284 XXX XX XX</li>
            </ul>
            
            <p style="color: #10b981; font-weight: bold;">G\xfcneş enerjisi ailesine hoş geldiniz! 🌞</p>
          </div>
        `,variables:["customerName","completionDate","systemSize","panelCount","dailyProduction","monthlyProduction","annualProduction","monthlySavings","monitoringUrl","userGuideUrl"],isActive:!0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}].forEach(a=>{this.templates.set(a.id,a)})}async sendNotification(a,b,c,d=["email"]){let e=[];for(let f of d){if(b.preferences&&!b.preferences[f])continue;let d=`${a}_${f}`,g=this.templates.get(d);if(!g||!g.isActive){console.warn(`Template not found or inactive: ${d}`);continue}let h={id:`notification-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,type:a,channel:f,recipient:b,data:c,status:"pending",createdAt:new Date().toISOString()};try{let a=this.processTemplate(g,c,b.language||"tr");switch(f){case"email":await this.sendEmail(b,a,g);break;case"sms":await this.sendSMS(b,a);break;case"whatsapp":await this.sendWhatsApp(b,a);break;case"push":await this.sendPush(b,a)}h.status="sent",h.sentAt=new Date().toISOString()}catch(a){h.status="failed",h.errorMessage=a instanceof Error?a.message:"Unknown error",console.error(`Failed to send ${f} notification:`,a)}e.push(h),this.logs.push(h)}return e}processTemplate(a,b,c="tr"){let d=a.subject||"",e=a.title,f=a.content;return Object.entries(b).forEach(([a,b])=>{let c=`{{${a}}}`,g=`{{${a}:format}}`,h=String(b||"");(a.toLowerCase().includes("price")||a.toLowerCase().includes("cost")||a.toLowerCase().includes("savings"))&&"number"==typeof b&&(h=new Intl.NumberFormat("tr-TR").format(b)),d=(d=d.replace(RegExp(c,"g"),h)).replace(RegExp(g,"g"),h),e=(e=e.replace(RegExp(c,"g"),h)).replace(RegExp(g,"g"),h),f=(f=f.replace(RegExp(c,"g"),h)).replace(RegExp(g,"g"),h)}),Object.entries({currentDate:new Date().toLocaleDateString("tr-TR"),currentYear:new Date().getFullYear().toString(),companyName:"EnerjiOS",supportPhone:"+90 284 XXX XX XX",supportEmail:"destek@enerjios.com",websiteUrl:"https://enerjios.com",dashboardUrl:"https://enerjios.com/dashboard",createdDate:new Date().toLocaleDateString("tr-TR")}).forEach(([a,b])=>{let c=`{{${a}}}`;d=d.replace(RegExp(c,"g"),b),e=e.replace(RegExp(c,"g"),b),f=f.replace(RegExp(c,"g"),b)}),{subject:d,title:e,content:f}}async sendEmail(a,b,c){await d._.sendQuoteDelivery({customerName:a.name,customerEmail:a.email,quoteNumber:`NOTIF-${Date.now()}`,projectTitle:b.title,totalAmount:0,validUntil:new Date(Date.now()+2592e6),quoteViewUrl:"https://app.com/quote",companyName:process.env.COMPANY_NAME||"EnerjiOS",engineerName:"System",deliveryToken:`token-${Date.now()}`,systemDetails:{capacity:0,panelCount:0,estimatedProduction:0,paybackPeriod:0}})}async sendSMS(a,b){if(!a.phone)throw Error("Phone number required for SMS");console.log("SMS would be sent:",{to:a.phone,message:b.content})}async sendWhatsApp(a,b){if(!a.phone)throw Error("Phone number required for WhatsApp");console.log("WhatsApp would be sent:",{to:a.phone,message:b.content})}async sendPush(a,b){console.log("Push notification would be sent:",{to:a.email,title:b.title,body:b.content})}getNotificationLogs(a){let b=[...this.logs];return a&&(a.type&&(b=b.filter(b=>b.type===a.type)),a.channel&&(b=b.filter(b=>b.channel===a.channel)),a.status&&(b=b.filter(b=>b.status===a.status)),a.recipient&&(b=b.filter(b=>b.recipient.email.includes(a.recipient)||b.recipient.name.includes(a.recipient))),a.dateFrom&&(b=b.filter(b=>b.createdAt>=a.dateFrom)),a.dateTo&&(b=b.filter(b=>b.createdAt<=a.dateTo))),b.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())}getTemplate(a){return this.templates.get(a)}getAllTemplates(){return Array.from(this.templates.values())}updateTemplate(a,b){let c=this.templates.get(a);if(!c)return!1;let d={...c,...b,updatedAt:new Date().toISOString()};return this.templates.set(a,d),!0}createTemplate(a){let b={...a,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return this.templates.set(a.id,b),b}getStatistics(a,b){let c=this.logs;(a||b)&&(c=c.filter(c=>{let d=c.createdAt;return(!a||!(d<a))&&(!b||!(d>b))}));let d=c.length,e=c.filter(a=>"sent"===a.status).length,f=c.filter(a=>"failed"===a.status).length,g=c.filter(a=>"pending"===a.status).length;return{totalSent:d,successful:e,failed:f,pending:g,successRate:d>0?e/d*100:0,byChannel:c.reduce((a,b)=>(a[b.channel]=(a[b.channel]||0)+1,a),{}),byType:c.reduce((a,b)=>(a[b.type]=(a[b.type]||0)+1,a),{})}}}let f=new e},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},93139:a=>{a.exports=import("bcryptjs")},94735:a=>{a.exports=require("events")},96330:a=>{a.exports=require("@prisma/client")},96434:(a,b)=>{Object.defineProperty(b,"__esModule",{value:!0})}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4996,1692,1693,140,4308,1873],()=>b(b.s=33420));module.exports=c})();