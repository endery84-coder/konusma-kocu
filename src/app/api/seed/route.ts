import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const exercises = [
    // NEFES EGZERSİZLERİ
    {
        title: 'Diyafram Nefesi',
        description: 'Karın bölgesini kullanarak derin nefes alma tekniği',
        category: 'nefes',
        duration_minutes: 5,
        difficulty: 1,
        is_premium: false,
        icon: '💨',
        instructions: '1. Rahat bir pozisyonda oturun\n2. Elinizi karnınıza koyun\n3. Burnunuzdan derin nefes alın\n4. Karnınızın şiştiğini hissedin\n5. Ağızdan yavaşça verin\n6. 10 kez tekrarlayın',
        target_goals: ['fluency', 'public_speaking', 'communication'],
    },
    {
        title: '4-7-8 Nefes Tekniği',
        description: 'Sakinleştirici nefes egzersizi',
        category: 'nefes',
        duration_minutes: 5,
        difficulty: 2,
        is_premium: false,
        icon: '🧘',
        instructions: '1. Rahat bir şekilde oturun\n2. 4 saniye boyunca burnunuzdan nefes alın\n3. 7 saniye nefesi tutun\n4. 8 saniye ağızdan yavaşça verin\n5. 4 döngü tekrarlayın',
        target_goals: ['fluency', 'public_speaking'],
    },
    {
        title: 'Konuşma Öncesi Nefes',
        description: 'Konuşmaya hazırlık nefes tekniği',
        category: 'nefes',
        duration_minutes: 3,
        difficulty: 1,
        is_premium: false,
        icon: '🎯',
        instructions: '1. Ayakta veya oturarak durun\n2. Omuzlarınızı gevşetin\n3. Derin bir nefes alın\n4. Yavaşça verin, omuzlarınız düşsün\n5. 3 kez tekrarlayın\n6. Artık konuşmaya hazırsınız',
        target_goals: ['fluency', 'public_speaking'],
    },

    // AKICILIK EGZERSİZLERİ
    {
        title: 'Yumuşak Başlangıç',
        description: 'Kelimelere yumuşak geçiş tekniği',
        category: 'akicilik',
        duration_minutes: 10,
        difficulty: 2,
        is_premium: false,
        icon: '🗣️',
        instructions: '1. Bir kelime seçin\n2. İlk sesi uzatarak başlayın (ssselam gibi)\n3. Yumuşak bir şekilde kelimenin geri kalanına geçin\n4. Farklı kelimelerle tekrarlayın\n5. Cümlelere geçin',
        target_goals: ['fluency'],
    },
    {
        title: 'DAF Egzersizi',
        description: 'Gecikmeli ses geri bildirimi ile pratik',
        category: 'akicilik',
        duration_minutes: 10,
        difficulty: 3,
        is_premium: true,
        icon: '🎧',
        instructions: '1. DAF modunu açın\n2. Gecikmeyi 100ms olarak ayarlayın\n3. Bir metin seçin\n4. Metni yüksek sesle okuyun\n5. Kendi sesinizi gecikmeli duyacaksınız\n6. Bu doğal olarak hızınızı yavaşlatır',
        target_goals: ['fluency'],
    },
    {
        title: 'Ritmik Konuşma',
        description: 'Metronom eşliğinde konuşma pratiği',
        category: 'akicilik',
        duration_minutes: 10,
        difficulty: 2,
        is_premium: true,
        icon: '🎵',
        instructions: '1. Metronomu açın\n2. Hızı 60 BPM olarak ayarlayın\n3. Her vuruşta bir hece söyleyin\n4. Me-tro-nom-la-ko-nuş-mak\n5. Yavaşça hızı artırın',
        target_goals: ['fluency'],
    },
    {
        title: 'Uzatma Tekniği',
        description: 'Sesleri uzatarak akıcı konuşma',
        category: 'akicilik',
        duration_minutes: 8,
        difficulty: 2,
        is_premium: false,
        icon: '〰️',
        instructions: '1. Bir kelime seçin\n2. İlk sesi 1-2 saniye uzatın\n3. Mmmerhaba şeklinde söyleyin\n4. Yavaş yavaş uzatmayı azaltın\n5. Farklı kelimelerle pratik yapın',
        target_goals: ['fluency'],
    },

    // OKUMA EGZERSİZLERİ
    {
        title: 'Sesli Okuma - Kolay',
        description: 'Kısa paragraf okuma pratiği',
        category: 'okuma',
        duration_minutes: 5,
        difficulty: 1,
        is_premium: false,
        icon: '📖',
        instructions: '1. Kayıt sayfasına gidin\n2. Gösterilen metni okuyun\n3. Rahat bir hızda, net telaffuz edin\n4. Noktalama işaretlerinde durun\n5. Kaydı dinleyin ve değerlendirin',
        target_goals: ['reading', 'fluency', 'turkish_learning'],
    },
    {
        title: 'Sesli Okuma - Orta',
        description: 'Orta uzunlukta metin okuma',
        category: 'okuma',
        duration_minutes: 10,
        difficulty: 2,
        is_premium: false,
        icon: '📚',
        instructions: '1. Daha uzun bir metin seçin\n2. Önce sessiz okuyun\n3. Sonra sesli okuyun\n4. Akıcılığa odaklanın\n5. Hızınızı kontrol edin',
        target_goals: ['reading', 'fluency'],
    },
    {
        title: 'Hız Okuma',
        description: 'Okuma hızını artırma egzersizi',
        category: 'okuma',
        duration_minutes: 10,
        difficulty: 3,
        is_premium: true,
        icon: '⚡',
        instructions: '1. Zamanlayıcıyı başlatın\n2. Metni olabildiğince hızlı okuyun\n3. Ancak anlaşılır kalın\n4. Sürenizi kaydedin\n5. Her seferinde iyileştirmeye çalışın',
        target_goals: ['reading'],
    },

    // TELAFFUZ EGZERSİZLERİ
    {
        title: 'Zor Sesler - Ş, Ç, Ğ',
        description: 'Türkçeye özgü sesleri pratik yapın',
        category: 'telaffuz',
        duration_minutes: 8,
        difficulty: 2,
        is_premium: false,
        icon: '🔤',
        instructions: '1. Şeker, Şemsiye, Şarkı\n2. Çiçek, Çanta, Çocuk\n3. Dağ, Bağ, Yağmur\n4. Her kelimeyi 3 kez tekrarlayın\n5. Ayna karşısında pratik yapın',
        target_goals: ['turkish_learning', 'fluency'],
    },
    {
        title: 'Hece Tekrarı',
        description: 'Heceleri net söyleme pratiği',
        category: 'telaffuz',
        duration_minutes: 5,
        difficulty: 1,
        is_premium: false,
        icon: '🔁',
        instructions: '1. Ba-be-bi-bo-bu\n2. Ca-ce-ci-co-cu\n3. Da-de-di-do-du\n4. Her heceyi net söyleyin\n5. Hızı yavaşça artırın',
        target_goals: ['turkish_learning', 'fluency', 'child'],
    },
    {
        title: 'Tekerleme Pratiği',
        description: 'Dil cambazlığı ile pratik',
        category: 'telaffuz',
        duration_minutes: 10,
        difficulty: 3,
        is_premium: false,
        icon: '👅',
        instructions: '1. "Şu köşe yaz köşesi"\n2. Yavaş başlayın\n3. Net telaffuz edin\n4. Yavaşça hızlanın\n5. Hata yapınca başa dönün',
        target_goals: ['fluency', 'turkish_learning'],
    },

    // SUNUM EGZERSİZLERİ
    {
        title: '2 Dakika Konuşma',
        description: 'Bir konu hakkında 2 dakika konuşun',
        category: 'sunum',
        duration_minutes: 5,
        difficulty: 2,
        is_premium: false,
        icon: '🎤',
        instructions: '1. Konu: "Bugün ne yaptım"\n2. 2 dakika boyunca konuşun\n3. Durmadan devam edin\n4. Kendinizi kaydedin\n5. Kaydı dinleyin',
        target_goals: ['public_speaking', 'communication'],
    },
    {
        title: 'Göz Teması Pratiği',
        description: 'Kameraya bakarak konuşma',
        category: 'sunum',
        duration_minutes: 5,
        difficulty: 2,
        is_premium: true,
        icon: '👁️',
        instructions: '1. Kameranızı açın\n2. Kameraya bakarak konuşun\n3. Gözlerinizi kaçırmayın\n4. 1 dakika boyunca sürdürün\n5. Dinleyiciye konuşuyormuş gibi hissedin',
        target_goals: ['public_speaking'],
    },

    // ÇOCUK EGZERSİZLERİ
    {
        title: 'Hayvan Sesleri',
        description: 'Hayvan seslerini taklit et',
        category: 'cocuk',
        duration_minutes: 5,
        difficulty: 1,
        is_premium: false,
        icon: '🐱',
        instructions: '1. Kedi: Miyav miyav!\n2. Köpek: Hav hav!\n3. İnek: Möö!\n4. Kuş: Cik cik!\n5. Her sesi 3 kez tekrarlayın',
        target_goals: ['child'],
    },
    {
        title: 'Şarkı Söyle',
        description: 'Çocuk şarkısı söyleme',
        category: 'cocuk',
        duration_minutes: 5,
        difficulty: 1,
        is_premium: false,
        icon: '🎶',
        instructions: '1. Sevdiğiniz bir şarkı seçin\n2. Birlikte söyleyin\n3. El hareketleri ekleyin\n4. Eğlenceli tutun!\n5. Alkışlayarak bitirin',
        target_goals: ['child'],
    },
];

export async function GET() {
    try {
        // Önce mevcut verileri kontrol et
        const { data: existing } = await supabaseAdmin
            .from('exercises')
            .select('id')
            .limit(1);

        if (existing && existing.length > 0) {
            return NextResponse.json({ message: 'Egzersizler zaten mevcut', count: existing.length });
        }

        // Yeni verileri ekle
        const { data, error } = await supabaseAdmin
            .from('exercises')
            .insert(exercises);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Egzersizler eklendi', count: exercises.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
