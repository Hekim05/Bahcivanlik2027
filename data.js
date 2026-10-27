/* Bahçıvanlık Eğitimi 2027 – varsayılan içerik
   Blok türleri: h (başlık), p (paragraf), b (kalın paragraf), c (ortalı kalın),
   r (sağa yaslı), ul (madde), ol (numaralı), tbl (tablo), chk (tik listesi) */
window.DEFAULT_DATA = {
  version: 1,
  title: "Bahçıvanlık Eğitimi 2027",
  org: "Çankaya Belediyesi · Park ve Bahçeler Müdürlüğü",
  sections: [
    {
      id: "tarih", icon: "📅", title: "Tarih ve Ramazan", parts: [{
        id: "tarih", title: "Tarih kararı", blocks: [
          { t: "p", x: "2026 düzeni korunursa eğitim 1–19 Şubat 2027 tarihlerine düşer ve 15 eğitim gününün 10'u Ramazan'a denk gelir. Diyanet takvimine göre Ramazan 8 Şubat 2027 Pazartesi başlar; Ramazan Bayramı 9–11 Mart 2027 (Salı–Perşembe), arife 8 Mart'tır." },
          { t: "p", x: "Ramazan'a denk gelmesi eğitimi engellemez; ancak çay-su ikramını, belge törenindeki ikramı ve devamı etkiler. 2025 programı da Ramazan'a denk gelmişti." },
          { t: "tbl", head: ["Dönem", "Şubat planı (2026 düzeni)", "Öneri A: Ramazan öncesi", "Öneri B: Bayram sonrası"], rows: [
            ["1. hafta", "1–5 Şubat", "18–22 Ocak", "15–19 Mart"],
            ["2. hafta", "8–12 Şubat (Ramazan)", "25–29 Ocak", "22–26 Mart"],
            ["3. hafta", "15–19 Şubat (Ramazan)", "1–5 Şubat", "29 Mart–2 Nisan"],
            ["Belge töreni", "19 Şubat Cuma (Ramazan)", "5 Şubat Cuma", "2 Nisan Cuma"],
            ["Ramazan/bayram çakışması", "10 gün", "Yok", "Yok"]
          ] },
          { t: "b", x: "Öneri A (18 Ocak–5 Şubat)" },
          { t: "p", x: "2026'ya en yakın dönemdir, Ramazan'dan 3 gün önce biter. Risk: 2027 ikram hizmet alımı ihalesi Ocak ortasına yetişmeyebilir; başvuru ve kayıt süreci de 2 hafta öne çekilir." },
          { t: "b", x: "Öneri B (15 Mart–2 Nisan) – önerilen" },
          { t: "p", x: "Ramazan ve bayramla çakışmaz; ihale ve yazışmalar için zaman kalır. Mart sonu meyve ağacı budaması ve uygulama günü için hava açısından da daha uygundur." },
          { t: "p", x: "Bu uygulamadaki program Şubat planıyla yazıldı ve Ramazan günleri işaretlendi. Tarih seçildiğinde tüm bölümlerdeki tarihleri birlikte güncelleyin." }
        ]
      }]
    },
    {
      id: "program", icon: "🗓️", title: "2027 Programı", parts: [{
        id: "program", title: "Program", blocks: [
          { t: "c", x: "Park ve Bahçeler Müdürlüğü\nBAHÇIVANLIK EĞİTİMİ 2027 Programı" },
          { t: "tbl", head: ["Tarih (2027)", "Saat", "Konu", "Eğitmen", "Not"], rows: [
            ["1. Hafta", "", "", "", ""],
            ["01 Şubat Pazartesi", "10.00", "Açılış", "Tüm ekip", ""],
            ["", "10.30–11.00", "İşte Eğitim Programımız", "Sertaç Hekim", ""],
            ["", "11.30–13.00", "Doğal Yöntemlerle Sebze Üretimi", "Sertaç Hekim", ""],
            ["02 Şubat Salı", "10.00–11.15", "Sebzelerde Hastalık ve Zararlılar", "Sertaç Hekim", ""],
            ["", "11.30–13.00", "Dış Mekân Bitkilerini Tanıyalım (1)", "Çiğdem Camkıran", ""],
            ["03 Şubat Çarşamba", "10.00–11.15", "Dış Mekân Bitkilerini Tanıyalım (2)", "Çiğdem Camkıran", ""],
            ["", "11.30–13.00", "Kendi Bahçeni Tasarla", "Selvinur Koç", ""],
            ["04 Şubat Perşembe", "10.00–13.00", "Örnek Bahçemizi Tasarlayalım", "Selvinur Koç", ""],
            ["05 Şubat Cuma", "10.00–13.00", "Temel Arıcılık", "Gamze Bahadırgil", ""],
            ["2. Hafta", "", "", "", ""],
            ["08 Şubat Pazartesi", "10.00–13.00", "Toprak Bilgisi ve Organik Gübre", "Ozan Gürgan", "Ramazan 1. gün"],
            ["09 Şubat Salı", "10.00–13.00", "İç Mekân Bitkileri ve Gül Üretimi", "Hasan Altın (misafir)", "Ramazan"],
            ["10 Şubat Çarşamba", "10.00–11.15", "Yağmur Suyu Hasadı", "Mehtap Yüksel (misafir)", "Ramazan"],
            ["", "11.30–13.00", "Sulama Yöntemlerinde Pratik Bilgiler", "Volkan Demir", "Ramazan"],
            ["11 Şubat Perşembe", "10.00–11.15", "Aşılama (teorik)", "Orhan Kemal Sarıhan (misafir)", "Ramazan"],
            ["", "11.30–13.00", "Aşılama (uygulama)", "Muharrem Canlı (misafir)", "Ramazan"],
            ["12 Şubat Cuma", "10.00–13.00", "Meyve Ağaçlarında Bakım", "Ozan Gürgan", "Ramazan"],
            ["3. Hafta", "", "", "", ""],
            ["15 Şubat Pazartesi", "10.00–11.15", "Meyve Ağaçlarında Hastalık ve Zararlılar", "Ozan Gürgan", "Ramazan"],
            ["", "11.30–13.00", "Kurakçıl Peyzaj", "Çiğdem Camkıran", "Ramazan"],
            ["16 Şubat Salı", "10.00–13.00", "Meyve Ağaçlarında Budama", "Orhan Kemal Sarıhan (misafir)", "Ramazan"],
            ["17 Şubat Çarşamba", "10.00–13.00", "Asma, Gül ve Çalı Budaması", "Orhan Kemal Sarıhan (misafir)", "Ramazan"],
            ["18 Şubat Perşembe", "10.00–11.15", "Terraryum Uygulaması", "Sertaç Hekim, Rabia Eskici", "Ramazan"],
            ["", "11.30–13.00", "Uygulama (hava şartlarına bağlı)", "Umut Parkı – tüm ekip", "Ramazan"],
            ["19 Şubat Cuma", "11.00", "Belge Töreni", "Tüm ekip", "Ramazan; ikram planını gözden geçirin"]
          ] },
          { t: "p", x: "Program 15 iş günü sürer. Açılış ve belge töreni dışında 21 ders oturumu vardır; bunların 6'sını misafir eğitmenler verir (Hasan Altın 1, Mehtap Yüksel 1, Muharrem Canlı 1, Orhan Kemal Sarıhan 3). Salon dersleri 10.00–13.00 arasındadır." }
        ]
      }]
    },
    {
      id: "gorev", icon: "🧑‍🤝‍🧑", title: "Görev ve Masa Planı", parts: [
        { id: "takvim", title: "Görev takvimi", blocks: [
          { t: "c", x: "PARK VE BAHÇELER MÜDÜRLÜĞÜ\nBAHÇIVANLIK EĞİTİMİ 2027 Görev Takvimi" },
          { t: "tbl", head: ["Tarih (2027)", "Saat", "Konu", "Eğitmen", "Salon Sorumlusu"], rows: [
            ["1. Hafta", "", "", "", ""],
            ["01 Şubat Pzt.", "10.00", "Açılış", "", "Tüm ekip"],
            ["", "10.30–11.00", "İşte Eğitim Programımız", "Sertaç Hekim", "Tüm ekip"],
            ["", "11.30–13.00", "Doğal Yöntemlerle Sebze Üretimi", "Sertaç Hekim", ""],
            ["02 Şubat Salı", "10.00–11.15", "Sebzelerde Hastalık ve Zararlılar", "Sertaç Hekim", ""],
            ["", "11.30–13.00", "Dış Mekân Bitkilerini Tanıyalım (1)", "Çiğdem Camkıran", ""],
            ["03 Şubat Çarş.", "10.00–11.15", "Dış Mekân Bitkilerini Tanıyalım (2)", "Çiğdem Camkıran", ""],
            ["", "11.30–13.00", "Kendi Bahçeni Tasarla", "Selvinur Koç", ""],
            ["04 Şubat Perş.", "10.00–13.00", "Örnek Bahçemizi Tasarlayalım", "Selvinur Koç", ""],
            ["05 Şubat Cuma", "10.00–13.00", "Temel Arıcılık", "Gamze Bahadırgil", ""],
            ["2. Hafta", "", "", "", ""],
            ["08 Şubat Pzt.", "10.00–13.00", "Toprak Bilgisi ve Organik Gübre", "Ozan Gürgan", ""],
            ["09 Şubat Salı", "10.00–13.00", "İç Mekân Bitkileri ve Gül Üretimi", "Hasan Altın", ""],
            ["10 Şubat Çarş.", "10.00–11.15", "Yağmur Suyu Hasadı", "Mehtap Yüksel", ""],
            ["", "11.30–13.00", "Sulama Yöntemlerinde Pratik Bilgiler", "Volkan Demir", ""],
            ["11 Şubat Perş.", "10.00–11.15", "Aşılama (teorik)", "Orhan Kemal Sarıhan", ""],
            ["", "11.30–13.00", "Aşılama (uygulama)", "Muharrem Canlı", ""],
            ["12 Şubat Cuma", "10.00–13.00", "Meyve Ağaçlarında Bakım", "Ozan Gürgan", ""],
            ["3. Hafta", "", "", "", ""],
            ["15 Şubat Pzt.", "10.00–11.15", "Meyve Ağaçlarında Hastalık ve Zararlılar", "Ozan Gürgan", ""],
            ["", "11.30–13.00", "Kurakçıl Peyzaj", "Çiğdem Camkıran", ""],
            ["16 Şubat Salı", "10.00–13.00", "Meyve Ağaçlarında Budama", "Orhan Kemal Sarıhan", ""],
            ["17 Şubat Çarş.", "10.00–13.00", "Asma, Gül ve Çalı Budaması", "Orhan Kemal Sarıhan", ""],
            ["18 Şubat Perş.", "10.00–11.15", "Terraryum Uygulaması", "Sertaç Hekim, Rabia Eskici", ""],
            ["", "11.30–13.00", "UYGULAMA", "Umut Parkı", ""],
            ["19 Şubat Cuma", "11.00", "Belge Töreni", "", "Tüm ekip"]
          ] }
        ] },
        { id: "salon", title: "Salon görevleri", blocks: [
          { t: "h", x: "Salon sorumlularının görevleri" },
          { t: "ul", items: [
            "İmza masalarının kurulumu ve takibi",
            "Sahne düzeninin kontrolü (bilgisayarın kurulumu ve tahsisi, ders bitiminde sahneden alınması)",
            "Soru-cevapta mikrofonun dolaştırılması",
            "Kursiyerlerle iletişim, olası soruların cevaplanması ve yardımcı olunması",
            "Salonun genel düzeni ve havalandırılmasının kontrolü"
          ] },
          { t: "p", x: "Satı Kılıç, Filiz Nacak ve Rabia Eskici bostanlardaki ders durumuna göre salona düzenli olarak gelecektir. Bunlara ek olarak 3 park görevlisi personel görevlendirilecektir." },
          { t: "h", x: "Diğer görevliler" },
          { t: "ol", items: ["", "", ""] }
        ] },
        { id: "masa", title: "Uygulama masaları", blocks: [
          { t: "h", x: "Uygulama günü masa planı (18 Şubat 2027, Umut Parkı)" },
          { t: "tbl", head: ["SN", "Masa konusu", "Sorumlu"], rows: [
            ["1", "Dış Mekân Bitkileri, Park Ağaçları Tanıtımı", "Çiğdem Camkıran, Selvinur Koç"],
            ["2", "Sebze Tohum Ekimi", "Sertaç Hekim"],
            ["3", "Mevsimlik Çiçek Dikimi", ""],
            ["4", "Şekil Budaması", ""],
            ["5", "Sulama Sistemleri ve Aparatları", "Volkan Demir"],
            ["6", "Toprak Bilgisi", "Ozan Gürgan"],
            ["7", "Genel Budama", ""],
            ["8", "Çalı Budaması", ""]
          ] }
        ] }
      ]
    },
    {
      id: "egitmen", icon: "👩‍🏫", title: "Eğitmen Listesi", parts: [{
        id: "egitmen", title: "Eğitmen listesi", blocks: [
          { t: "c", x: "Bahçıvanlık Eğitimi 2027 – Eğitmen Listesi ve Program Bilgileri" },
          { t: "p", x: "Bu belge, Bahçıvanlık Eğitimi 2027 kapsamında eğitim verecek misafir ve personel eğitmenlerimizin listesini içermektedir. Eğitmenlerimiz, teorik ve pratik derslerle katılımcılara bahçıvanlık konusunda bilgi ve beceri kazandıracaktır. Programın ana hedefleri arasında iklim değişikliğine uyumlu bahçıvanlık teknikleri, kurakçıl peyzaj, sürdürülebilir tarım uygulamaları ve doğal yöntemlerle bitki yetiştirme yer almaktadır." },
          { t: "p", x: "Eğitimler boyunca hem deneyimli bahçıvanlar hem de bu alana yeni başlayanlar için faydalı olacak pratik bilgiler paylaşılacak ve bilimsel doğrulara dayalı uygulamalar aktarılacaktır. Eğitmen kadromuz kendi alanlarında uzman kişilerden oluşmakta olup aşağıdaki tabloda yer alan eğitimleri verecektir." },
          { t: "tbl", head: ["Eğitmen Adı", "Eğitmen Statüsü", "Eğitim Konuları"], rows: [
            ["Hasan Altın", "Misafir Eğitmen", "İç Mekân Bitkileri ve Gül Üretimi"],
            ["Muharrem Canlı", "Misafir Eğitmen", "Aşılama (uygulama)"],
            ["Orhan Kemal Sarıhan", "Misafir Eğitmen", "Aşılama (teorik), Meyve Ağaçlarında Budama, Asma, Gül ve Çalı Budaması"],
            ["Mehtap Yüksel", "Misafir Eğitmen", "Yağmur Suyu Hasadı"],
            ["Sertaç Hekim", "Personel Eğitmen", "Doğal Yöntemlerle Sebze Üretimi, Sebzelerde Hastalık ve Zararlılar, Terraryum Uygulaması"],
            ["Selvinur Koç", "Personel Eğitmen", "Kendi Bahçeni Tasarla, Örnek Bahçemizi Tasarlayalım"],
            ["Çiğdem Camkıran", "Personel Eğitmen", "Dış Mekân Bitkilerini Tanıyalım, Kurakçıl Peyzaj"],
            ["Ozan Gürgan", "Personel Eğitmen", "Toprak Bilgisi ve Organik Gübre, Meyve Ağaçlarında Bakım, Meyve Ağaçlarında Hastalık ve Zararlılar"],
            ["Gamze Bahadırgil", "Personel Eğitmen", "Temel Arıcılık"],
            ["Rabia Eskici", "Personel Eğitmen", "Terraryum Uygulaması"],
            ["Volkan Demir", "Personel Eğitmen", "Sulama Yöntemlerinde Pratik Bilgiler"]
          ] },
          { t: "p", x: "Bu eğitim programının verimli ve keyifli geçmesi dileğiyle!" }
        ]
      }]
    },
    {
      id: "yazilar", icon: "✉️", title: "Resmî Yazılar", parts: [
        { id: "olur", title: "1. Başkanlık OLUR", blocks: [
          { t: "c", x: "T.C.\nÇANKAYA BELEDİYE BAŞKANLIĞI\nPark ve Bahçeler Müdürlüğü" },
          { t: "p", x: "Sayı: [E-43838605-020-____]\nKonu: Bahçıvanlık Eğitimi Hk." },
          { t: "c", x: "BAŞKANLIK MAKAMINA" },
          { t: "p", x: "Müdürlüğümüzce, ilçe halkının çevre bilincini geliştirerek yaşanabilir çevre ve örnek bahçeleriyle daha güzel bir Çankaya için 01.02.2027–19.02.2027 tarihleri arasında Bahçıvanlık Eğitimi verilmesi düşünülmektedir." },
          { t: "p", x: "Makamınızca da uygun görüldüğü takdirde, Müdürlüğümüz tarafından düzenlenecek olan Bahçıvanlık Eğitiminin verilebilmesi hususunu OLUR'larınıza arz ederim." },
          { t: "r", x: "[Turan AKYOL]\n[Park ve Bahçeler Müdür V.]" },
          { t: "c", x: "OLUR\n[Ad SOYAD]\n[Belediye Başkan Yardımcısı]" }
        ] },
        { id: "ksim", title: "2. KSİM yazısı", blocks: [
          { t: "c", x: "T.C.\nÇANKAYA BELEDİYE BAŞKANLIĞI\nPark ve Bahçeler Müdürlüğü" },
          { t: "p", x: "Sayı: [E-43838605-010.10-____]\nKonu: 2027 Yılı Kültürel ve Sosyal Etkinlikler Organizasyon Hizmet Alımı" },
          { t: "c", x: "KÜLTÜR VE SOSYAL İŞLER MÜDÜRLÜĞÜNE" },
          { t: "p", x: "İlgi: [gg.aa.2026] tarihli ve [E-75923808-010.10-____] sayılı yazı." },
          { t: "p", x: "İlgide kayıtlı yazınızda 2027 yılı için Kültürel ve Sosyal Etkinlikler Organizasyonlarında kullanılmak üzere hizmet alımı ihalesi için ihtiyaç listesi istenmiştir." },
          { t: "p", x: "Bu kapsamda Müdürlüğümüzün 2027 yılında yapılması planlanan etkinlik ve organizasyonlar için ihtiyaç listesi yazımız ekinde gönderilmiştir." },
          { t: "p", x: "Gereğini bilgilerinize arz ederim." },
          { t: "r", x: "[Turan AKYOL]\n[Park ve Bahçeler Müdür V.]" },
          { t: "p", x: "Ek: İhtiyaç Listesi (1 sayfa) – İhtiyaç Listeleri bölümü, KSİM talep listesi" }
        ] },
        { id: "basin", title: "3. Basın Yayın yazısı", blocks: [
          { t: "c", x: "T.C.\nÇANKAYA BELEDİYE BAŞKANLIĞI\nPark ve Bahçeler Müdürlüğü" },
          { t: "p", x: "Sayı: [E-43838605-____]\nKonu: 2027 Yılı Bahçıvanlık Eğitimi ve Kent Tarım Faaliyetleri Basılı Malzeme İhtiyacı" },
          { t: "c", x: "BASIN VE YAYIN MÜDÜRLÜĞÜNE" },
          { t: "p", x: "Müdürlüğümüzce 2011 yılından bu yana düzenlenen Bahçıvanlık Eğitiminin 2027 yılı programı 01.02.2027–19.02.2027 tarihleri arasında yapılacaktır. Eğitimin ve Kent Bostanları faaliyetlerinin duyurusu, tanıtımı ve eğitim süresince kullanılmak üzere ekte belirtilen basılı malzemelere ihtiyaç duyulmaktadır." },
          { t: "p", x: "Kültür ve Sosyal İşler Müdürlüğünün 17.11.2025 tarihli ve E-75923808-819-1506276 sayılı yazısında kartlı davetiye, afiş, pankart, el ilanı, not defteri ve katılım sertifikası kalemleri Müdürlüğünüzün görev alanında gösterilmiştir." },
          { t: "p", x: "Ekte sunulan ihtiyaç listesi ve teknik şartnamede yer alan malzemelerin temini hususunda gereğini bilgilerinize arz ederim." },
          { t: "r", x: "[Turan AKYOL]\n[Park ve Bahçeler Müdür V.]" },
          { t: "p", x: "Ek-1: İhtiyaç Listesi (Basın Yayın listesi)\nEk-2: Teknik Şartname" }
        ] },
        { id: "alman", title: "4. Alman Büyükelçiliği", blocks: [
          { t: "c", x: "T.C.\nÇANKAYA BELEDİYE BAŞKANLIĞI\nPark ve Bahçeler Müdürlüğü" },
          { t: "p", x: "Sayı: [____]\nKonu: Bahçıvanlık Eğitimi – Eğitmen Görevlendirmesi" },
          { t: "c", x: "[ALMANYA FEDERAL CUMHURİYETİ ANKARA BÜYÜKELÇİLİĞİNE]" },
          { t: "p", x: "Çankaya halkının ekoloji bilincini geliştirerek örnek bahçeleriyle daha güzel bir Çankaya için Müdürlüğümüzce 2011 yılından bu yana Bahçıvanlık Eğitimleri düzenlenmektedir." },
          { t: "p", x: "Sosyal bir proje olarak devam eden eğitimlerimizden bugüne kadar [____] kişi yararlanmıştır. Bu yıl 01–19 Şubat 2027 tarihleri arasında 300 kişinin katılımının planlandığı Bahçıvanlık Eğitimi yapılacaktır." },
          { t: "p", x: "Eğitimimizde 09 Şubat 2027 tarihinde, saat 10.00–13.00 arasında, önceki yıllarda da eğitimlerimize başarıyla katkı veren Büyükelçiliğinizin Bahçe Sorumlusu Sayın Hasan Altın'ın görevlendirilmesini arz ederim." },
          { t: "p", x: "Uygun görülmesi hâlinde ulaşımı, şoför [Alphan Yılmaz] tarafından [06 FCF 490] plakalı araçla sağlanacaktır." },
          { t: "r", x: "[Turan AKYOL]\n[Park ve Bahçeler Müdür V.]" }
        ] },
        { id: "misafir", title: "5. Misafir eğitmen şablonu", blocks: [
          { t: "p", x: "Muharrem Canlı, Orhan Kemal Sarıhan ve Mehtap Yüksel için aynı metin kullanılır; kurum ve ders bilgisi aşağıdaki tablodan doldurulur." },
          { t: "c", x: "T.C.\nÇANKAYA BELEDİYE BAŞKANLIĞI\nPark ve Bahçeler Müdürlüğü" },
          { t: "p", x: "Sayı: [____]\nKonu: Bahçıvanlık Eğitimi – Eğitmen Görevlendirmesi" },
          { t: "c", x: "[KURUM ADI]" },
          { t: "p", x: "Müdürlüğümüzce 2011 yılından bu yana düzenlenen ve bugüne kadar [____] kişinin yararlandığı Bahçıvanlık Eğitiminin 2027 yılı programı 01–19 Şubat 2027 tarihleri arasında 300 katılımcıyla yapılacaktır." },
          { t: "p", x: "Eğitimimizde [tarih] tarihinde, saat [saat] arasında verilecek \"[ders adı]\" dersi için kurumunuz personeli Sayın [Ad SOYAD]'ın görevlendirilmesini arz ederim." },
          { t: "r", x: "[Turan AKYOL]\n[Park ve Bahçeler Müdür V.]" },
          { t: "tbl", head: ["Eğitmen", "Kurum", "Tarih ve saat", "Ders"], rows: [
            ["Mehtap Yüksel", "[ ]", "10 Şubat 2027, 10.00–11.15", "Yağmur Suyu Hasadı"],
            ["Orhan Kemal Sarıhan", "[ ]", "11 Şubat 2027, 10.00–11.15; 16–17 Şubat 2027, 10.00–13.00", "Aşılama (teorik); Meyve Ağaçlarında Budama; Asma, Gül ve Çalı Budaması"],
            ["Muharrem Canlı", "[ ]", "11 Şubat 2027, 11.30–13.00", "Aşılama (uygulama)"]
          ] }
        ] }
      ]
    },
    {
      id: "ihtiyac", icon: "📦", title: "İhtiyaç ve Şartname", parts: [
        { id: "ksimliste", title: "KSİM talep listesi", blocks: [
          { t: "c", x: "ÇANKAYA BELEDİYESİ\nPARK VE BAHÇELER MÜDÜRLÜĞÜ\n2027 YILI Kültürel ve Sosyal Etkinlikler İÇİN TALEP LİSTESİ" },
          { t: "tbl", head: ["Sıra No", "Etkinlik veya organizasyon adı", "Yapılması planlanan ay veya tarih", "İş kalemi", "Miktar", "Birimi"], rows: [
            ["1", "Bahçıvanlık Eğitimi", "01–19 Şubat 2027", "Catering hizmeti / çay ve su ikramı", "300 kişi", "[1] gün"],
            ["2", "Bahçıvanlık Eğitimi açılış ve kapanışı", "01 Şubat ve 19 Şubat 2027", "Açılış ve kapanış için sunucu", "1 kişi", "2 gün"]
          ] },
          { t: "p", x: "Tanzim eden: [Ad SOYAD, görev unvanı]\nTasdik eden: [Ad SOYAD, Müdür]" },
          { t: "p", x: "Not: 2026 resmî talepte ikram \"300 kişi, 1 gün\" olarak yazılmıştı. İkramın her ders günü mü, yalnızca açılış ve tören günü mü verileceğini netleştirip gün sayısını güncelleyin. Kartlı davetiye bu listeye yazılmaz; 2026'da KSİM tarafından Basın Yayın'a yönlendirilmişti." }
        ] },
        { id: "basinliste", title: "Basın Yayın listesi", blocks: [
          { t: "c", x: "Park ve Bahçeler Müdürlüğü\n2027 Yılı Kent Tarım Hobi Evleri ve Bahçıvanlık Eğitim Faaliyetleri İhtiyaç Listesi" },
          { t: "tbl", head: ["S.No", "Malzeme adı", "Özellikler", "Adet", "Açıklama"], rows: [
            ["1", "El broşürü", "A4, 3 kırım", "1.000", "Kent Bostanları için 500, Bahçıvanlık Eğitimi için 500 adet; kentsel tarım hizmetlerinin tanıtımı için"],
            ["2", "Afiş", "50 × 70 cm", "70", "Bahçıvanlık Eğitimi duyurusu için"],
            ["3", "Pankart", "1,5 × 5 m vinil (branda), renkli baskı", "5", "Bahçıvanlık Eğitimi duyurusu için"],
            ["4", "Kitapçık", "13,5 × 19,5 cm, 300 sayfa", "2.000", "Bahçıvanlık Eğitimi ve kentsel tarım eğitimlerinde kullanılmak üzere"],
            ["5", "Kartlı davetiye", "[ölçü ve kâğıt]", "124", "Mahalle muhtarlarının açılışa zarflı daveti için"],
            ["6", "Bloknot", "15 × 21 cm, 50 yaprak", "1.000", "Son 10 sayfa, önceki bloknotta olduğu gibi bilgi sayfaları olacak"],
            ["7", "Katılım sertifikası", "[ölçü ve kâğıt]", "300", "Belge töreninde kursiyerlere verilmek üzere (2026'da nasıl karşılandığını kontrol edin)"]
          ] }
        ] },
        { id: "sartname", title: "Teknik şartname", blocks: [
          { t: "c", x: "TEKNİK ŞARTNAME" },
          { t: "b", x: "1. Broşür" },
          { t: "ul", items: ["21 × 29,7 cm (A4) ebatlı, 3 kırımlı olacak.", "90 g/m² kuşe kâğıda basılacak.", "İçerik ve tasarım birimimizle birlikte yapılacak."] },
          { t: "b", x: "2. Kitapçık" },
          { t: "ul", items: ["13,5 × 19,5 cm ebatlı, 300 sayfa olacak.", "İç sayfalar 80 g kitap kâğıdı, tek renk baskı, perforajlı olacak.", "Kapak 300 g kraft, 4 renk (trikromi) baskı olacak.", "Baskı kalitesinden kaynaklanan sorunlardan firma sorumlu olacak; sorunlu baskılar firma tarafından ücretsiz yenilenecek."] },
          { t: "b", x: "3. Pankart" },
          { t: "ul", items: ["450 g/m² vinil (branda), 1,5 × 5 m, renkli baskı olacak.", "Köşe noktalarında metal bağlama delikleri olacak."] },
          { t: "b", x: "4. Afiş" },
          { t: "ul", items: ["50 × 70 cm ebatlı, renkli baskı olacak."] },
          { t: "b", x: "5. Bloknot" },
          { t: "ul", items: ["15 × 21 cm, 50 yaprak olacak.", "İç sayfalar 80 g 1. hamur, renkli baskı, perforajlı olacak.", "Kapak 300 g kuşe, selefonlu olacak."] },
          { t: "b", x: "6. Kartlı davetiye ve 7. Katılım sertifikası" },
          { t: "ul", items: ["[Ölçü, kâğıt ve baskı bilgileri eklenecek.]"] },
          { t: "p", x: "Basılacak tüm malzemelerin tasarımı yükleniciye ait olup profesyonel bir tarzda hazırlanacak; tasarım Müdürlüğümüzce onaylandıktan sonra baskıya girecektir." }
        ] }
      ]
    },
    {
      id: "acilis", icon: "🎤", title: "Açılış ve Sunucu", parts: [
        { id: "konusma", title: "Açılış konuşması", blocks: [
          { t: "c", x: "Açılış Konuşması (2027)" },
          { t: "p", x: "Değerli katılımcılar, Çankaya Belediyesi Park ve Bahçeler Müdürlüğü tarafından düzenlenen 2027 yılı Bahçıvanlık Eğitimine hepiniz hoş geldiniz." },
          { t: "p", x: "Doğaya ve yeşile gönül veren sizleri aramızda görmekten büyük mutluluk duyuyoruz. 2011 yılından bu yana aralıksız sürdürdüğümüz ve büyük ilgiyle karşılanan bu eğitimlerde bugüne kadar toplam [____] kişiye ulaştık. Bahçıvanlık kültürünü bu kadar geniş bir kitleyle paylaşmanın gururunu yaşıyoruz." },
          { t: "p", x: "Bu eğitimlerin başarısındaki en büyük pay eğitmen kadromuza aittir. Derslerimiz, uzun yıllardır belediyemizde çalışan, bizzat sahada uygulama yapan ve şehrimizin yeşil alanlarına emeği geçen personelimizle değerli misafir eğitmenlerimiz tarafından verilmektedir. Teorik bilgiyi saha deneyimiyle birleştiren bu ekiple eğitimlerimizi önümüzdeki yıllarda da sürdürmeyi planlıyoruz." },
          { t: "p", x: "Son iki yıldır eğitimimizin ana teması \"su ve su kullanımı\" oldu. Bu yıl bu temayı bir adım ileri taşıyor ve \"[İklime uyumlu bahçe: su ve kuraklık]\" başlığıyla ele alıyoruz. Yağmur suyu hasadı, sulama yöntemleri ve kurakçıl peyzaj derslerimiz daha az suyla yaşayan bahçelerin nasıl kurulacağını gösterecek. Temel arıcılık dersimiz ise bahçelerimizin tozlayıcılarla ne kadar iç içe olduğunu hatırlatacak." },
          { t: "p", x: "Hepinize verimli ve keyifli bir eğitim dönemi diliyorum." }
        ] },
        { id: "akis", title: "Açılış akışı", blocks: [
          { t: "c", x: "PARK VE BAHÇELER MÜDÜRLÜĞÜ\nBAHÇIVANLIK EĞİTİMİ\n01.02.2027 – Program Akışı" },
          { t: "ol", items: ["10.00 Açılış", "İstiklal Marşı ve saygı duruşu", "Başkanın açılış konuşması", "Program tanıtımı (Sertaç Hekim)"] },
          { t: "b", x: "Bilgi notu (sunucu için)" },
          { t: "ul", items: [
            "Bahçıvanlık Eğitimine 2011 yılından bu yana [____] kişi katıldı ve sertifika almaya hak kazandı.",
            "Bu eğitimlerle yalnızca kentsel tarım ve bahçıvanlık bilgisi değil; doğa farkındalığı, çevre bilinci ve farklı sosyal çevrelerin kaynaşması da hedeflenmektedir.",
            "2027 eğitimimize [____] başvuru yapılmış, 300 kişinin kaydı alınmıştır.",
            "Bu yılın teması: [İklime uyumlu bahçe: su ve kuraklık]."
          ] }
        ] },
        { id: "toren", title: "Belge töreni akışı", blocks: [
          { t: "c", x: "BAHÇIVANLIK EĞİTİMİ\n19.02.2027 – Belge Töreni Akışı (öneri)" },
          { t: "ol", items: ["11.00 Karşılama ve açılış", "İstiklal Marşı ve saygı duruşu", "Eğitim dönemi değerlendirmesi (Sertaç Hekim)", "[Başkan veya Başkan Yardımcısı] konuşması", "Eğitmenlere teşekkür", "Belgelerin dağıtılması", "Toplu fotoğraf ve ikram"] },
          { t: "b", x: "Bilgi notu (sunucu için)" },
          { t: "ul", items: ["Bu yıl [____] kursiyer belge almaya hak kazanmıştır.", "Bu dönemle birlikte eğitimlerimizden yararlanan toplam kişi sayısı [____] olmuştur."] }
        ] }
      ]
    },
    {
      id: "kursiyer", icon: "👥", title: "Kursiyerler", parts: [{
        id: "liste", title: "Kursiyer listesi", blocks: [
          { t: "p", x: "Kursiyer listesini Ayarlar (⚙️) → Excel'den yükle ile bu sekmeye aktarın. Liste ada göre A→Z sıralanır ve numaralanır; elle eklenen isimler de düzenleme bitince sıraya girer." },
          { t: "tbl", head: ["No", "Ad Soyad"], rows: [], count: "kursiyer", sort: true }
        ]
      }]
    },
    {
      id: "acik", icon: "✅", title: "Açık Noktalar", parts: [{
        id: "acik", title: "Açık noktalar", blocks: [
          { t: "p", x: "Köşeli parantezli [ ] alanlar sizin dolduracağınız bilgilerdir. Bir maddeyi tamamladığınızda tik atın; ilerleme şeridine yansır." },
          { t: "h", x: "Karar verilecek veya eklenecekler" },
          { t: "chk", items: [
            { x: "Tarih: Şubat planı mı, Öneri A mı, Öneri B mi?", done: false },
            { x: "2026'da belge alan kişi sayısı (toplam sayaç 4039 + bu sayı)", done: false },
            { x: "2027 teması (taslakta \"İklime uyumlu bahçe: su ve kuraklık\")", done: false },
            { x: "Uygulama gününde boş kalan 4 masanın sorumluları", done: false },
            { x: "Diğer görevliler (3 boş satır)", done: false },
            { x: "Misafir eğitmenlerin kurumları (Muharrem Canlı, Orhan Kemal Sarıhan, Mehtap Yüksel)", done: false },
            { x: "Hasan Altın yazısı için şoför ve araç plakası", done: false },
            { x: "Müdür ve başkan yardımcısı adlarının güncelliği", done: false },
            { x: "2027 KSİM ihtiyaç listesi yazısının ilgi tarihi ve sayısı", done: false },
            { x: "Tohum takası uygulama gününe eklensin mi?", done: false }
          ] },
          { t: "h", x: "2026 dosyalarına göre yapılan düzeltmeler" },
          { t: "ul", items: [
            "Gamze Bahadırgil (Temel Arıcılık) ve Orhan Kemal Sarıhan'ın aşılama dersi eğitmen listesine eklendi.",
            "Kurakçıl Peyzaj, Meyve Ağaçlarında Bakım ve Hastalıklar eğitmen listesine işlendi.",
            "İhale yazışmasına göre davetiye, afiş, pankart, el ilanı, bloknot ve sertifika Basın Yayın listesine; ikram ve sunucu KSİM listesine ayrıldı.",
            "İkram sayısı her yerde 300 kişi olarak eşitlendi (2026 iç listede 350 yazıyordu).",
            "Yazım düzeltmeleri: Yöntelerinde → Yöntemlerinde, meken → mekân, Meyva → Meyve, Rabiye → Rabia, Selvi Nur → Selvinur, Catring → Catering, Bhaçıvanlık → Bahçıvanlık, havanlandırılması → havalandırılması.",
            "Şartnamede broşür ölçüsü \"21x29.7 mm\" yerine \"21 × 29,7 cm (A4)\", bloknotta \"farfarjlı\" yerine \"perforajlı\" yazıldı; kontrol edin."
          ] }
        ]
      }]
    }
  ]
};
