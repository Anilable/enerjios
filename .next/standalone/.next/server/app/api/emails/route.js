(()=>{var a={};a.id=7245,a.ids=[7245],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},28342:(a,b,c)=>{"use strict";c.d(b,{u:()=>w});var d=Object.defineProperty,e=Object.defineProperties,f=Object.getOwnPropertyDescriptors,g=Object.getOwnPropertySymbols,h=Object.prototype.hasOwnProperty,i=Object.prototype.propertyIsEnumerable,j=(a,b,c)=>b in a?d(a,b,{enumerable:!0,configurable:!0,writable:!0,value:c}):a[b]=c,k=(a,b)=>{for(var c in b||(b={}))h.call(b,c)&&j(a,c,b[c]);if(g)for(var c of g(b))i.call(b,c)&&j(a,c,b[c]);return a},l=(a,b,c)=>new Promise((d,e)=>{var f=a=>{try{h(c.next(a))}catch(a){e(a)}},g=a=>{try{h(c.throw(a))}catch(a){e(a)}},h=a=>a.done?d(a.value):Promise.resolve(a.value).then(f,g);h((c=c.apply(a,b)).next())}),m=class{constructor(a){this.resend=a}create(a){return l(this,arguments,function*(a,b={}){return yield this.resend.post("/api-keys",a,b)})}list(){return l(this,null,function*(){return yield this.resend.get("/api-keys")})}remove(a){return l(this,null,function*(){return yield this.resend.delete(`/api-keys/${a}`)})}},n=class{constructor(a){this.resend=a}create(a){return l(this,arguments,function*(a,b={}){return yield this.resend.post("/audiences",a,b)})}list(){return l(this,null,function*(){return yield this.resend.get("/audiences")})}get(a){return l(this,null,function*(){return yield this.resend.get(`/audiences/${a}`)})}remove(a){return l(this,null,function*(){return yield this.resend.delete(`/audiences/${a}`)})}};function o(a){var b;return{attachments:null==(b=a.attachments)?void 0:b.map(a=>({content:a.content,filename:a.filename,path:a.path,content_type:a.contentType,content_id:a.contentId})),bcc:a.bcc,cc:a.cc,from:a.from,headers:a.headers,html:a.html,reply_to:a.replyTo,scheduled_at:a.scheduledAt,subject:a.subject,tags:a.tags,text:a.text,to:a.to}}var p=class{constructor(a){this.resend=a}send(a){return l(this,arguments,function*(a,b={}){return this.create(a,b)})}create(a){return l(this,arguments,function*(a,b={}){let d=[];for(let b of a){if(b.react){if(!this.renderAsync)try{let{renderAsync:a}=yield c.e(1762).then(c.t.bind(c,81762,19));this.renderAsync=a}catch(a){throw Error("Failed to render React component. Make sure to install `@react-email/render`")}b.html=yield this.renderAsync(b.react),b.react=void 0}d.push(o(b))}return yield this.resend.post("/emails/batch",d,b)})}},q=class{constructor(a){this.resend=a}create(a){return l(this,arguments,function*(a,b={}){if(a.react){if(!this.renderAsync)try{let{renderAsync:a}=yield c.e(1762).then(c.t.bind(c,81762,19));this.renderAsync=a}catch(a){throw Error("Failed to render React component. Make sure to install `@react-email/render`")}a.html=yield this.renderAsync(a.react)}return yield this.resend.post("/broadcasts",{name:a.name,audience_id:a.audienceId,preview_text:a.previewText,from:a.from,html:a.html,reply_to:a.replyTo,subject:a.subject,text:a.text},b)})}send(a,b){return l(this,null,function*(){return yield this.resend.post(`/broadcasts/${a}/send`,{scheduled_at:null==b?void 0:b.scheduledAt})})}list(){return l(this,null,function*(){return yield this.resend.get("/broadcasts")})}get(a){return l(this,null,function*(){return yield this.resend.get(`/broadcasts/${a}`)})}remove(a){return l(this,null,function*(){return yield this.resend.delete(`/broadcasts/${a}`)})}update(a,b){return l(this,null,function*(){return yield this.resend.patch(`/broadcasts/${a}`,{name:b.name,audience_id:b.audienceId,from:b.from,html:b.html,text:b.text,subject:b.subject,reply_to:b.replyTo,preview_text:b.previewText})})}},r=class{constructor(a){this.resend=a}create(a){return l(this,arguments,function*(a,b={}){return yield this.resend.post(`/audiences/${a.audienceId}/contacts`,{unsubscribed:a.unsubscribed,email:a.email,first_name:a.firstName,last_name:a.lastName},b)})}list(a){return l(this,null,function*(){return yield this.resend.get(`/audiences/${a.audienceId}/contacts`)})}get(a){return l(this,null,function*(){return a.id||a.email?yield this.resend.get(`/audiences/${a.audienceId}/contacts/${(null==a?void 0:a.email)?null==a?void 0:a.email:null==a?void 0:a.id}`):{data:null,error:{message:"Missing `id` or `email` field.",name:"missing_required_field"}}})}update(a){return l(this,null,function*(){return a.id||a.email?yield this.resend.patch(`/audiences/${a.audienceId}/contacts/${(null==a?void 0:a.email)?null==a?void 0:a.email:null==a?void 0:a.id}`,{unsubscribed:a.unsubscribed,first_name:a.firstName,last_name:a.lastName}):{data:null,error:{message:"Missing `id` or `email` field.",name:"missing_required_field"}}})}remove(a){return l(this,null,function*(){return a.id||a.email?yield this.resend.delete(`/audiences/${a.audienceId}/contacts/${(null==a?void 0:a.email)?null==a?void 0:a.email:null==a?void 0:a.id}`):{data:null,error:{message:"Missing `id` or `email` field.",name:"missing_required_field"}}})}},s=class{constructor(a){this.resend=a}create(a){return l(this,arguments,function*(a,b={}){return yield this.resend.post("/domains",{name:a.name,region:a.region,custom_return_path:a.customReturnPath},b)})}list(){return l(this,null,function*(){return yield this.resend.get("/domains")})}get(a){return l(this,null,function*(){return yield this.resend.get(`/domains/${a}`)})}update(a){return l(this,null,function*(){return yield this.resend.patch(`/domains/${a.id}`,{click_tracking:a.clickTracking,open_tracking:a.openTracking,tls:a.tls})})}remove(a){return l(this,null,function*(){return yield this.resend.delete(`/domains/${a}`)})}verify(a){return l(this,null,function*(){return yield this.resend.post(`/domains/${a}/verify`)})}},t=class{constructor(a){this.resend=a}send(a){return l(this,arguments,function*(a,b={}){return this.create(a,b)})}create(a){return l(this,arguments,function*(a,b={}){if(a.react){if(!this.renderAsync)try{let{renderAsync:a}=yield c.e(1762).then(c.t.bind(c,81762,19));this.renderAsync=a}catch(a){throw Error("Failed to render React component. Make sure to install `@react-email/render`")}a.html=yield this.renderAsync(a.react)}return yield this.resend.post("/emails",o(a),b)})}get(a){return l(this,null,function*(){return yield this.resend.get(`/emails/${a}`)})}update(a){return l(this,null,function*(){return yield this.resend.patch(`/emails/${a.id}`,{scheduled_at:a.scheduledAt})})}cancel(a){return l(this,null,function*(){return yield this.resend.post(`/emails/${a}/cancel`)})}},u="undefined"!=typeof process&&process.env&&process.env.RESEND_BASE_URL||"https://api.resend.com",v="undefined"!=typeof process&&process.env&&process.env.RESEND_USER_AGENT||"resend-node:6.0.2",w=class{constructor(a){if(this.key=a,this.apiKeys=new m(this),this.audiences=new n(this),this.batch=new p(this),this.broadcasts=new q(this),this.contacts=new r(this),this.domains=new s(this),this.emails=new t(this),!a&&("undefined"!=typeof process&&process.env&&(this.key=process.env.RESEND_API_KEY),!this.key))throw Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');this.headers=new Headers({Authorization:`Bearer ${this.key}`,"User-Agent":v,"Content-Type":"application/json"})}fetchRequest(a){return l(this,arguments,function*(a,b={}){try{let c=yield fetch(`${u}${a}`,b);if(!c.ok)try{let a=yield c.text();return{data:null,error:JSON.parse(a)}}catch(b){if(b instanceof SyntaxError)return{data:null,error:{name:"application_error",message:"Internal server error. We are unable to process your request right now, please try again later."}};let a={message:c.statusText,name:"application_error"};if(b instanceof Error){let c,d;return{data:null,error:(c=k({},a),d={message:b.message},e(c,f(d)))}}return{data:null,error:a}}return{data:yield c.json(),error:null}}catch(a){return{data:null,error:{name:"application_error",message:"Unable to fetch data. The request could not be resolved."}}}})}post(a,b){return l(this,arguments,function*(a,b,c={}){let d=new Headers(this.headers);c.idempotencyKey&&d.set("Idempotency-Key",c.idempotencyKey);let e=k({method:"POST",headers:d,body:JSON.stringify(b)},c);return this.fetchRequest(a,e)})}get(a){return l(this,arguments,function*(a,b={}){let c=k({method:"GET",headers:this.headers},b);return this.fetchRequest(a,c)})}put(a,b){return l(this,arguments,function*(a,b,c={}){let d=k({method:"PUT",headers:this.headers,body:JSON.stringify(b)},c);return this.fetchRequest(a,d)})}patch(a,b){return l(this,arguments,function*(a,b,c={}){let d=k({method:"PATCH",headers:this.headers,body:JSON.stringify(b)},c);return this.fetchRequest(a,d)})}delete(a,b){return l(this,null,function*(){let c={method:"DELETE",headers:this.headers,body:JSON.stringify(b)};return this.fetchRequest(a,c)})}}},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},45392:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>I,patchFetch:()=>H,routeModule:()=>D,serverHooks:()=>G,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>F});var d={};c.r(d),c.d(d,{GET:()=>C,POST:()=>B});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(28342),w=c(60140),x=c(37947);let y=process.env.RESEND_API_KEY?new v.u(process.env.RESEND_API_KEY):null,z={projectStatusUpdate:a=>({subject:`Proje G\xfcncelleme: ${a.projectName}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">🔄 Proje Durumu G\xfcncellendi</h2>
        </div>
        
        <div style="padding: 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0;">${a.projectName}</h3>
          <p><strong>Yeni Durum:</strong> ${a.status}</p>
          <p><strong>İlerleme:</strong> %${a.progress}</p>
          ${a.message?`<p><strong>Mesaj:</strong> ${a.message}</p>`:""}
          
          <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 6px;">
            <p style="margin: 0;"><strong>Proje Detayları:</strong></p>
            <p style="margin: 5px 0;">Sistem Kapasitesi: ${a.systemSize} kW</p>
            <p style="margin: 5px 0;">Lokasyon: ${a.location}</p>
            ${a.nextStep?`<p style="margin: 5px 0;">Sonraki Adım: ${a.nextStep}</p>`:""}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${a.projectUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Projeyi G\xf6r\xfcnt\xfcle
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #6b7280; font-size: 14px;">
          <p>Bu email EnerjiOS sistemi tarafından otomatik olarak g\xf6nderilmiştir.</p>
          <p>\xa9 2024 EnerjiOS. T\xfcm hakları saklıdır.</p>
        </div>
      </div>
    `}),customerWelcome:a=>({subject:`EnerjiOS'a Hoş Geldiniz, ${a.customerName}!`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌞 EnerjiOS</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0;">G\xfcneş enerjisi ile geleceği inşa ediyoruz</p>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Merhaba ${a.customerName},</h2>
          
          <p>EnerjiOS ailesine hoş geldiniz! G\xfcneş enerjisi yolculuğunuzda size rehberlik etmekten mutluluk duyacağız.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2563eb;">✨ Size \xd6zel Hizmetlerimiz</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin: 8px 0;">\xdccretsiz saha incelemesi ve sistem tasarımı</li>
              <li style="margin: 8px 0;">7/24 sistem izleme ve performans raporları</li>
              <li style="margin: 8px 0;">25 yıl garanti ve teknik destek</li>
              <li style="margin: 8px 0;">Mobil uygulama ile anlık takip</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${a.dashboardUrl}" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Panelinize Giriş Yapın
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p><strong>İletişim Bilgileriniz:</strong></p>
            <p>📧 Email: ${a.email}</p>
            <p>📱 Telefon: ${a.phone}</p>
            ${a.projectAssignee?`<p>👤 Proje Sorumlusu: ${a.projectAssignee}</p>`:""}
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #6b7280; font-size: 14px;">
          <p>Sorularınız i\xe7in: info@enerjios.com | +90 XXX XXX XXXX</p>
          <p>\xa9 2024 EnerjiOS. T\xfcm hakları saklıdır.</p>
        </div>
      </div>
    `}),invoiceGenerated:a=>({subject:`Faturanız Hazır - ${a.invoiceNumber}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">📄 Fatura Bildirimi</h2>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h3>Sayın ${a.customerName},</h3>
          <p>Faturanız hazırlanmış ve sistemde yer almıştır.</p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Fatura Detayları</h4>
            <p style="margin: 5px 0;"><strong>Fatura No:</strong> ${a.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Tutar:</strong> ₺${a.amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Vade Tarihi:</strong> ${a.dueDate}</p>
            <p style="margin: 5px 0;"><strong>Proje:</strong> ${a.projectName}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${a.invoiceUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Faturayı G\xf6r\xfcnt\xfcle
            </a>
            <a href="${a.paymentUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              \xd6deme Yap
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>💡 \xd6deme Se\xe7enekleri:</strong></p>
            <ul style="margin: 10px 0 0 0; font-size: 14px;">
              <li>Banka havalesi ile \xf6deme</li>
              <li>Kredi kartı ile online \xf6deme</li>
              <li>Taksitli \xf6deme se\xe7enekleri</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #6b7280; font-size: 14px;">
          <p>Bu fatura ile ilgili sorularınız i\xe7in muhasebe@enerjios.com</p>
        </div>
      </div>
    `}),maintenanceReminder:a=>({subject:`Bakım Hatırlatması - ${a.projectName}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">🔧 Bakım Hatırlatması</h2>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h3>Sayın ${a.customerName},</h3>
          <p>Solar sisteminiz i\xe7in bakım zamanı geldi.</p>
          
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Bakım Detayları</h4>
            <p style="margin: 5px 0;"><strong>Sistem:</strong> ${a.projectName}</p>
            <p style="margin: 5px 0;"><strong>Son Bakım:</strong> ${a.lastMaintenance}</p>
            <p style="margin: 5px 0;"><strong>\xd6nerilen Tarih:</strong> ${a.suggestedDate}</p>
            <p style="margin: 5px 0;"><strong>Bakım T\xfcr\xfc:</strong> ${a.maintenanceType}</p>
          </div>
          
          ${a.performanceIssues?`
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626;"><strong>⚠️ Dikkat:</strong></p>
            <p style="margin: 5px 0 0 0; color: #dc2626;">${a.performanceIssues}</p>
          </div>
          `:""}
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${a.scheduleUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Bakım Randevusu Al
            </a>
          </div>
        </div>
      </div>
    `})},A=w.Ik({to:w.KC([w.Yj().email(),w.YO(w.Yj().email())]),template:w.k5(["projectStatusUpdate","customerWelcome","invoiceGenerated","maintenanceReminder"]),data:w.g1(w.Yj(),w.bz()),from:w.Yj().email().optional(),replyTo:w.Yj().email().optional()});async function B(a){try{let b;if(!process.env.RESEND_API_KEY)return u.NextResponse.json({error:"Resend API key not configured"},{status:500});let c=await a.json(),{to:d,template:e,data:f,from:g,replyTo:h}=A.parse(c),i=z[e];if(!i)return u.NextResponse.json({error:"Email template not found"},{status:404});let{subject:j,html:k}=i(f),l={from:g||"EnerjiOS <noreply@enerjios.com>",to:Array.isArray(d)?d:[d],subject:j,html:k,replyTo:h};if(y?b=await y.emails.send(l):(console.log("Email would be sent:",l),b={data:{id:`mock_${Date.now()}`},error:null}),b.error)return console.error("Resend API Error:",b.error),u.NextResponse.json({error:"Failed to send email",details:b.error},{status:500});return u.NextResponse.json({success:!0,messageId:b.data?.id,recipients:l.to,template:e,sentAt:new Date().toISOString()})}catch(a){if(console.error("Email API Error:",a),a instanceof x.G)return u.NextResponse.json({error:"Invalid request data",details:a.issues},{status:400});return u.NextResponse.json({error:"Failed to send email",message:a instanceof Error?a.message:"Unknown error"},{status:500})}}async function C(a){try{let{searchParams:b}=new URL(a.url),c=b.get("template"),d="true"===b.get("preview");if(!c)return u.NextResponse.json({templates:Object.keys(z),usage:"Use ?template=templateName&preview=true to preview a template"});let e=z[c];if(!e)return u.NextResponse.json({error:"Template not found"},{status:404});if(d){let{subject:a,html:b}=e({projectStatusUpdate:{projectName:"GES Projesi - \xd6rnek M\xfcşteri",status:"Kurulum Tamamlandı",progress:100,message:"Sisteminiz başarıyla kuruldu ve devreye alındı.",systemSize:10.5,location:"İstanbul, T\xfcrkiye",nextStep:"İlk aylık performans raporu 30 g\xfcn i\xe7inde g\xf6nderilecektir.",projectUrl:"https://enerjios.com/projects/demo"},customerWelcome:{customerName:"Mehmet Yılmaz",email:"mehmet@example.com",phone:"+90 532 123 4567",dashboardUrl:"https://enerjios.com/dashboard",projectAssignee:"Ahmet Kaya"},invoiceGenerated:{customerName:"Fatma Demir",invoiceNumber:"INV-2024-001",amount:85e3,dueDate:"15 Ocak 2025",projectName:"Konut GES Sistemi",invoiceUrl:"https://enerjios.com/invoices/demo",paymentUrl:"https://enerjios.com/payments/demo"},maintenanceReminder:{customerName:"Ali \xd6zkan",projectName:"Ticari GES Sistemi",lastMaintenance:"15 Haziran 2024",suggestedDate:"15 Aralık 2024",maintenanceType:"Panel temizliği ve genel kontrol",scheduleUrl:"https://enerjios.com/maintenance/schedule",performanceIssues:"Son haftalarda %5 verim kaybı tespit edildi."}}[c]);return new u.NextResponse(b,{headers:{"Content-Type":"text/html"}})}return u.NextResponse.json({template:c,description:"Email template ready for use"})}catch(a){return console.error("Email Template Preview Error:",a),u.NextResponse.json({error:"Failed to generate template preview",message:a instanceof Error?a.message:"Unknown error"},{status:500})}}let D=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/emails/route",pathname:"/api/emails",filename:"route",bundlePath:"app/api/emails/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\trakya-solar\\src\\app\\api\\emails\\route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:E,workUnitAsyncStorage:F,serverHooks:G}=D;function H(){return(0,g.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:F})}async function I(a,b,c){var d;let e="/api/emails/route";"/index"===e&&(e="/");let g=await D.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:C}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[C]);if(F&&!x){let a=!!y.routes[C],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||D.isDev||x||(G="/index"===(G=C)?"/":G);let H=!0===D.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>D.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>D.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await D.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await D.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||b instanceof s.NoFallbackError||await D.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4996,1692,140],()=>b(b.s=45392));module.exports=c})();