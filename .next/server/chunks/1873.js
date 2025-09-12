exports.id=1873,exports.ids=[1873],exports.modules={35552:(a,b,c)=>{"use strict";c.d(b,{db:()=>e,z:()=>f});var d=c(96330);let e=globalThis.prisma??new d.PrismaClient({log:["query"]}),f=e},67360:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{N:()=>k});var e=c(23168),f=c(28120),g=c(75783),h=c(93139),i=c(35552),j=a([h]);h=(j.then?(await j)():j)[0];let k={adapter:(0,e.y)(i.db),session:{strategy:"jwt"},pages:{signIn:"/auth/signin"},providers:[...process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET?[(0,g.A)({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET})]:[],(0,f.A)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(a){if(!a?.email||!a?.password)return null;try{let b=await i.db.user.findUnique({where:{email:a.email},include:{company:!0,customer:!0,farmer:!0}});if(!b||!b.password||!await h.default.compare(a.password,b.password))return null;return{id:b.id,email:b.email,name:b.name,role:b.role,status:b.status,image:b.image}}catch(a){return console.error("Auth error:",a),null}}})],callbacks:{jwt:async({token:a,user:b,trigger:c,session:d})=>(b&&(a.role=b.role,a.status=b.status),"update"===c&&d&&(a.name=d.user?.name,a.email=d.user?.email),a),session:async({session:a,token:b})=>(b&&(a.user.id=b.sub,a.user.role=b.role,a.user.status=b.status),a),redirect:async({url:a,baseUrl:b})=>a.startsWith("/")?`${b}${a}`:new URL(a).origin===b?a:b},events:{async signIn({user:a,isNewUser:b}){b&&(console.log(`New user signed up: ${a.email}`),a.email&&!a.role&&(await i.db.user.update({where:{id:a.id},data:{role:"CUSTOMER",status:"ACTIVE"}}),await i.db.customer.create({data:{userId:a.id,type:"INDIVIDUAL",firstName:a.name?.split(" ")[0]||"",lastName:a.name?.split(" ")[1]||""}})))}},debug:!1};d()}catch(a){d(a)}})},78335:()=>{},82716:(a,b,c)=>{"use strict";c.d(b,{_:()=>e});let d=new(c(28342)).u(process.env.RESEND_API_KEY);class e{static validateConfig(){if(!process.env.RESEND_API_KEY)throw Error("RESEND_API_KEY environment variable is required");if(!process.env.FROM_EMAIL)throw Error("FROM_EMAIL environment variable is required");process.env.COMPANY_NAME||console.warn("COMPANY_NAME environment variable not set, using default")}static getFromEmail(){let a=process.env.COMPANY_NAME||"EnerjiOS",b=process.env.FROM_EMAIL;return`${a} <${b}>`}static async sendQuoteDelivery(a){try{this.validateConfig(),console.log("\uD83D\uDCE7 Attempting to send quote delivery email..."),console.log("To:",a.customerEmail),console.log("Quote:",a.quoteNumber),console.log("Token:",a.deliveryToken);let b=await d.emails.send({from:this.getFromEmail(),to:a.customerEmail,subject:`${a.companyName} - G\xfcneş Enerji Sistemi Teklifiz: ${a.quoteNumber}`,html:this.generateQuoteDeliveryHTML(a),text:this.generateQuoteDeliveryText(a)});return console.log("✅ Quote email sent successfully:",b),{success:!0,messageId:b.data?.id}}catch(b){console.error("❌ Quote email sending failed:",b);let a="Unknown email error";return b instanceof Error&&(a=b.message),{success:!1,error:a}}}static async sendQuoteStatusUpdate(a,b,c){try{this.validateConfig();let e=await d.emails.send({from:this.getFromEmail(),to:a.customerEmail,subject:`${a.companyName} - ${{APPROVED:"Teklifiniz Onaylandı! \uD83C\uDF89",REJECTED:"Teklif Durum G\xfcncellemesi",EXPIRED:"Teklif S\xfcresi Doldu ⏰"}[b]}`,html:this.generateQuoteStatusHTML(a,b,c),text:this.generateQuoteStatusText(a,b,c)});return{success:!0,messageId:e.data?.id}}catch(a){return console.error("❌ Quote status email sending failed:",a),{success:!1,error:a instanceof Error?a.message:"Unknown error"}}}static async sendPhotoRequest(a){try{this.validateConfig(),console.log("\uD83D\uDCE7 Attempting to send photo request email..."),console.log("To:",a.customerEmail),console.log("From:",this.getFromEmail()),console.log("Token:",a.token),console.log("Upload URL:",a.uploadUrl);let b=await d.emails.send({from:this.getFromEmail(),to:a.customerEmail,subject:"EnerjiOS - Fotoğraf Talebi",html:this.generatePhotoRequestHTML(a),text:this.generatePhotoRequestText(a)});return console.log("✅ Email sent successfully:",b),{success:!0,messageId:b.data?.id}}catch(b){console.error("❌ Email sending failed:",b);let a="Unknown email error";return b instanceof Error&&(a=b.message),b&&"object"==typeof b&&"message"in b&&console.error("Resend API Error Details:",b),{success:!1,error:a}}}static generatePhotoRequestHTML(a){return`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>EnerjiOS - Fotoğraf Talebi</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🌞 ${process.env.COMPANY_NAME||"EnerjiOS"}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">G\xfcneş Enerjisi Projeniz İ\xe7in Fotoğraf Talebi</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <!-- Greeting -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Merhaba ${a.customerName},</h2>
                <div style="line-height: 1.8; color: #374151; font-size: 16px; white-space: pre-line;">
  ${a.message}
                </div>
              </div>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <p style="margin: 0 0 15px 0; color: #166534; font-weight: bold; font-size: 18px;">📷 Fotoğraflarınızı Y\xfckleyin</p>
                  <a href="${a.uploadUrl}" 
                    style="background: linear-gradient(135deg, #16a34a, #22c55e); 
                            color: white; 
                            padding: 16px 32px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            font-size: 16px;
                            display: inline-block;
                            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                            transition: transform 0.2s;">
                    🚀 Fotoğraf Y\xfckleme Sayfasına Git
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
                  Bu link <strong>${a.expiryDays} g\xfcn</strong> boyunca ge\xe7erlidir. L\xfctfen en kısa s\xfcrede fotoğraflarınızı y\xfckleyin.
                </p>
              </div>
              
              <!-- Guidelines -->
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 25px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; display: flex; align-items: center;">
                  📋 Fotoğraf \xc7ekim Rehberi
                </h3>
                <div style="line-height: 1.8; color: #374151; font-size: 15px; white-space: pre-line;">
  ${a.guidelines}
                </div>
              </div>
              
              <!-- Engineer Info -->
              <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px;">👨‍💼 İletişim</h3>
                <p style="margin: 5px 0; color: #374151; font-size: 16px;">
                  <strong>${a.engineerName}</strong><br>
                  <span style="color: #6b7280;">${a.engineerTitle}</span><br>
                  <span style="color: #3b82f6; font-weight: 500;">${process.env.COMPANY_NAME||"EnerjiOS"}</span>
                </p>
              </div>
              
              <!-- Security Note -->
              <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  🔒 <strong>G\xfcvenlik:</strong> Bu e-posta sadece size g\xf6nderilmiştir. Link'i başkalarıyla paylaşmayın.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 25px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Bu e-posta ${process.env.COMPANY_NAME||"EnerjiOS"} tarafından g\xf6nderilmiştir.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                G\xfcneş Enerjisi \xc7\xf6z\xfcmleri | Token: ${a.token.substring(0,8)}...
              </p>
            </div>
          </div>
        </body>
        </html>
      `}static generatePhotoRequestText(a){return`
  EnerjiOS - Fotoğraf Talebi

  Merhaba ${a.customerName},

  ${a.message}

  FOTOĞRAF Y\xdcKLEME LİNKİ:
  ${a.uploadUrl}

  FOTOĞRAF REHBERİ:
  ${a.guidelines}

  İLETİŞİM:
  ${a.engineerName} - ${a.engineerTitle}
  ${process.env.COMPANY_NAME||"EnerjiOS"}

  Bu link ${a.expiryDays} g\xfcn boyunca ge\xe7erlidir.

  Token: ${a.token}
      `.trim()}static async testEmailService(){try{return this.validateConfig(),console.log("\uD83E\uDDEA Testing email service configuration..."),console.log("RESEND_API_KEY:",process.env.RESEND_API_KEY?"✅ Set":"❌ Not set"),console.log("FROM_EMAIL:",process.env.FROM_EMAIL||"❌ Not set"),console.log("COMPANY_NAME:",process.env.COMPANY_NAME||"⚠️ Using default"),{success:!0}}catch(a){return console.error("❌ Email service test failed:",a),{success:!1,error:a instanceof Error?a.message:"Unknown error"}}}static generateQuoteDeliveryHTML(a){let b=a.validUntil.toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric"});return`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${a.companyName} - G\xfcneş Enerji Sistemi Teklifi</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">☀️ ${a.companyName}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">G\xfcneş Enerji Sistemi Teklifiniz Hazır!</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <!-- Greeting -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Sayın ${a.customerName},</h2>
                <p style="line-height: 1.8; color: #374151; font-size: 16px; margin: 0;">
                  ${a.projectTitle} projeniz i\xe7in hazırlanan teklifimiz aşağıdaki linkten inceleyebilirsiniz.
                  Teklifimizi detaylı olarak g\xf6r\xfcnt\xfcleyebilir, onaylayabilir veya sorularınızı iletebilirsiniz.
                </p>
              </div>
              
              <!-- System Overview -->
              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #92400e; font-size: 18px; text-align: center;">🏠 Sistem \xd6zellikleri</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${a.systemDetails.capacity} kW</div>
                    <div style="font-size: 12px; color: #92400e;">Sistem G\xfcc\xfc</div>
                  </div>
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${a.systemDetails.panelCount} Adet</div>
                    <div style="font-size: 12px; color: #92400e;">G\xfcneş Paneli</div>
                  </div>
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 18px; font-weight: bold; color: #10b981;">${a.systemDetails.estimatedProduction.toLocaleString()} kWh</div>
                    <div style="font-size: 12px; color: #92400e;">Yıllık \xdcretim</div>
                  </div>
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 18px; font-weight: bold; color: #8b5cf6;">${a.systemDetails.paybackPeriod} Yıl</div>
                    <div style="font-size: 12px; color: #92400e;">Geri \xd6deme</div>
                  </div>
                </div>
              </div>
              
              <!-- Price -->
              <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">💰 Toplam Yatırım</h3>
                <div style="font-size: 32px; font-weight: bold; color: #15803d; margin: 10px 0;">
                  ${a.totalAmount.toLocaleString("tr-TR")} ₺
                </div>
                <p style="margin: 10px 0 0 0; color: #166534; font-size: 14px;">KDV Dahil • 25 Yıl Garanti</p>
              </div>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="margin-bottom: 20px;">
                  <a href="${a.quoteViewUrl}" 
                    style="background: linear-gradient(135deg, #f59e0b, #eab308); 
                            color: white; 
                            padding: 18px 36px; 
                            text-decoration: none; 
                            border-radius: 10px; 
                            font-weight: bold; 
                            font-size: 18px;
                            display: inline-block;
                            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
                            transition: transform 0.2s;">
                    🔍 Teklifi İncele ve Onayla
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                  <strong>Teklif No:</strong> ${a.quoteNumber} • 
                  <strong>Ge\xe7erlilik:</strong> ${b} tarihine kadar
                </p>
              </div>
              
              <!-- Features -->
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 25px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">✨ Teklifimize Dahil Olanlar</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8;">
                  <li>Y\xfcksek verimli g\xfcneş panelleri</li>
                  <li>Premium kalite inverter sistemi</li>
                  <li>T\xfcm montaj malzemeleri ve iş\xe7ilik</li>
                  <li>Elektrik bağlantısı ve devreye alma</li>
                  <li>25 yıl panel performans garantisi</li>
                  <li>10 yıl inverter garantisi</li>
                  <li>\xdccretsiz teknik destek</li>
                </ul>
              </div>
              
              <!-- Contact -->
              <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">👨‍💼 İletişim</h3>
                <p style="margin: 5px 0; color: #374151; font-size: 16px;">
                  <strong>${a.engineerName}</strong><br>
                  ${a.engineerTitle||"Proje Uzmanı"}<br>
                  <span style="color: #3b82f6; font-weight: 500;">${a.companyName}</span>
                </p>
                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                  Herhangi bir sorunuz varsa bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 25px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Bu teklif ${a.companyName} tarafından hazırlanmıştır.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                G\xfcneş Enerjisi ile Geleceğe | Token: ${a.deliveryToken.substring(0,8)}...
              </p>
            </div>
          </div>
        </body>
        </html>
      `}static generateQuoteDeliveryText(a){return`
  ${a.companyName} - G\xfcneş Enerji Sistemi Teklifi

  Sayın ${a.customerName},

  ${a.projectTitle} projeniz i\xe7in hazırlanan teklifimiz hazır.

  SİSTEM \xd6ZELLİKLERİ:
  • Sistem G\xfcc\xfc: ${a.systemDetails.capacity} kW
  • Panel Sayısı: ${a.systemDetails.panelCount} adet
  • Yıllık \xdcretim: ${a.systemDetails.estimatedProduction.toLocaleString()} kWh
  • Geri \xd6deme S\xfcresi: ${a.systemDetails.paybackPeriod} yıl

  TOPLAM YATIRIM: ${a.totalAmount.toLocaleString("tr-TR")} ₺ (KDV Dahil)

  TEKLİF İNCELEME LİNKİ:
  ${a.quoteViewUrl}

  Teklif No: ${a.quoteNumber}
  Ge\xe7erlilik: ${a.validUntil.toLocaleDateString("tr-TR")} tarihine kadar

  İLETİŞİM:
  ${a.engineerName} - ${a.engineerTitle||"Proje Uzmanı"}
  ${a.companyName}

  Token: ${a.deliveryToken}
      `.trim()}static generateQuoteStatusHTML(a,b,c){let d={APPROVED:{title:"Teklifiniz Onaylandı! \uD83C\uDF89",color:"#22c55e",bgColor:"#f0fdf4",message:"G\xfcneş enerji sistemi teklifinizi onayladığınız i\xe7in teşekk\xfcr ederiz! En kısa s\xfcrede sizinle iletişime ge\xe7eceğiz.",nextSteps:"Sırada neler var:\n• S\xf6zleşme hazırlığı\n• Kurulum tarihi planlama\n• Teknik keşif randevusu\n• Proje uygulama s\xfcreci"},REJECTED:{title:"Teklif Durumu G\xfcncellemesi",color:"#ef4444",bgColor:"#fef2f2",message:"Teklifinizle ilgili kararınızı aldığınız i\xe7in teşekk\xfcr ederiz. Geri bildirimleriniz bizim i\xe7in değerli.",nextSteps:"Gelecekte yeni teklifler hazırlayabiliriz:\n• Revize teklif talebi\n• Farklı sistem se\xe7enekleri\n• Finansman alternatifleri"},EXPIRED:{title:"Teklif S\xfcresi Doldu ⏰",color:"#f59e0b",bgColor:"#fffbeb",message:"Teklifinizin ge\xe7erlilik s\xfcresi dolmuştur. Yeni bir teklif hazırlamak i\xe7in bizimle iletişime ge\xe7ebilirsiniz.",nextSteps:"Yeni teklif i\xe7in:\n• G\xfcncel fiyatlarla yeni teklif\n• Sistem yapılandırması incelemesi\n• Yeni ge\xe7erlilik tarihi"}}[b];return`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${a.companyName} - ${d.title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: ${d.color}; color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${d.title}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Teklif: ${a.quoteNumber}</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Sayın ${a.customerName},</h2>
                <p style="line-height: 1.8; color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                  ${d.message}
                </p>
              </div>
              
              <!-- Status Details -->
              <div style="background: ${d.bgColor}; border-left: 4px solid ${d.color}; padding: 25px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📋 ${d.title}</h3>
                <div style="line-height: 1.8; color: #374151; font-size: 15px; white-space: pre-line;">
  ${d.nextSteps}
                </div>
              </div>
              
              ${c?`
              <!-- Customer Comments -->
              <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">💬 Yorumunuz:</h4>
                <p style="margin: 0; color: #374151; font-style: italic; line-height: 1.6;">
                  "${c}"
                </p>
              </div>
              `:""}
              
              <!-- Contact -->
              <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">📞 İletişim</h3>
                <p style="margin: 0; color: #374151; font-size: 16px;">
                  <strong>${a.engineerName}</strong><br>
                  ${a.engineerTitle||"Proje Uzmanı"}<br>
                  <span style="color: #3b82f6; font-weight: 500;">${a.companyName}</span>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 25px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                ${a.companyName} - G\xfcneş Enerjisi \xc7\xf6z\xfcmleri
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Bu bilgilendirme ${new Date().toLocaleDateString("tr-TR")} tarihinde g\xf6nderilmiştir.
              </p>
            </div>
          </div>
        </body>
        </html>
      `}static generateQuoteStatusText(a,b,c){let d={APPROVED:"TEKLİF ONAYLANDI!",REJECTED:"TEKLİF DURUM G\xdcNCELLEMESİ",EXPIRED:"TEKLİF S\xdcRESİ DOLDU"};return`
  ${a.companyName} - ${d[b]}

  Sayın ${a.customerName},

  Teklif: ${a.quoteNumber}
  Durum: ${d[b]}
  Tarih: ${new Date().toLocaleDateString("tr-TR")}

  ${c?`YORUMUNUZ:
"${c}"

`:""}

  İLETİŞİM:
  ${a.engineerName} - ${a.engineerTitle||"Proje Uzmanı"}
  ${a.companyName}

  Token: ${a.deliveryToken}
      `.trim()}}},96487:()=>{}};