import { StockNewsItem } from '../types';

export const STOCK_NEWS_DATABASE: Record<string, StockNewsItem[]> = {
  WCORP: [
    // Positive (5)
    {
      id: 'wcorp_pos_1',
      symbol: 'WCORP',
      headline: '🏢 W-Corp ปิดดีลยักษ์! คว้าสัมปทานพัฒนา AiLuv Central District',
      detail: 'ประธานมาร์คัส ประกาศลงนามความร่วมมือสร้างเมกะโปรเจกต์มิกซ์ยูสมูลค่าหมื่นล้านบาท คาดการณ์รายได้โตทะลุเป้าในปีนี้',
      impact: 'positive',
      priceBiasPercent: 12.5
    },
    {
      id: 'wcorp_pos_2',
      symbol: 'WCORP',
      headline: '📈 งบไตรมาสล่าสุด W-Corp กำไรพุ่ง 180% จากธุรกิจอสังหาฯ หรู',
      detail: 'ยอดจองคอนโดมิเนียมระดับอัลตราลักชัวรีใจกลางเมืองขายหมดภายใน 15 นาที นักวิเคราะห์ปรับเป้าหมายราคาหุ้นขึ้นฉับพลัน',
      impact: 'positive',
      priceBiasPercent: 15.0
    },
    {
      id: 'wcorp_pos_3',
      symbol: 'WCORP',
      headline: '💎 W-Corp ประกาศจ่ายเงินปันผลพิเศษ 15% แก่ผู้ถือหุ้น',
      detail: 'จากกระแสเงินสดล้นมือ บอร์ดบริหารอนุมัติจ่ายเงินปันผลตอบแทนนักลงทุน สร้างความเชื่อมั่นในตลาดหุ้นอย่างล้นหลาม',
      impact: 'positive',
      priceBiasPercent: 8.0
    },
    {
      id: 'wcorp_pos_4',
      symbol: 'WCORP',
      headline: '🤝 กองทุนต่างชาติแห่เข้าซื้อหุ้น W-Corp สะสมเข้าพอร์ตกว่า 50 ล้านหุ้น',
      detail: 'ความมั่นคงทางโครงสร้างการเงินและสินทรัพย์สถาบันหนุนให้ W-Corp กลายเป็นหุ้นบลูชิปยอดนิยมสูงสุดของเมือง',
      impact: 'positive',
      priceBiasPercent: 10.0
    },
    {
      id: 'wcorp_pos_5',
      symbol: 'WCORP',
      headline: '🌟 W-Corp แตกไลน์ธุรกิจสมาร์ทซิตี้ ร่วมมือค่ายเทคระดับโลก',
      detail: 'เตรียมนำเทคโนโลยี AI และพลังงานสะอาดมาใช้ในตึกทั้งหมดของเครือ ดันภาพลักษณ์กรีนเอเนอร์ยี่รับเทรนด์อนาคต',
      impact: 'positive',
      priceBiasPercent: 7.5
    },
    // Negative (5)
    {
      id: 'wcorp_neg_1',
      symbol: 'WCORP',
      headline: '⚠️ สรรพากรเข้าตรวจสอบบัญชีย้อนหลังโครงการก่อสร้าง W-Corp',
      detail: 'มีข่าวลือเรื่องความไม่แน่ชัดในการประเมินภาษีที่ดิน ส่งผลให้นักลงทุนเทขายหุ้นเพื่อลดความเสี่ยงชั่วคราว',
      impact: 'negative',
      priceBiasPercent: -12.0
    },
    {
      id: 'wcorp_neg_2',
      symbol: 'WCORP',
      headline: '🏗️ โครงการมิกซ์ยูส W-Corp ล่าช้า เหตุซัพพลายเออร์วัสดุก่อสร้างขาดแคลน',
      detail: 'ราคาเหล็กและคอนกรีตพุ่งสูงขึ้น กระทบต้นทุนก่อสร้างและอาจทำให้กำหนดการโอนห้องพักยืดออกไปอีก 2 ไตรมาส',
      impact: 'negative',
      priceBiasPercent: -9.5
    },
    {
      id: 'wcorp_neg_3',
      symbol: 'WCORP',
      headline: '📉 ตลาดอสังหาฯ ชะลอตัว ดอกเบี้ยสูงกดดันยอดกู้ซื้อบ้านกลุ่มไฮเอนด์',
      detail: 'สถาบันการเงินเพิ่มความเข้มงวดในการปล่อยสินเชื่อบ้าน ส่งผลกระทบโดยตรงต่อยอดโอนอสังหาริมทรัพย์ของ W-Corp',
      impact: 'negative',
      priceBiasPercent: -7.0
    },
    {
      id: 'wcorp_neg_4',
      symbol: 'WCORP',
      headline: '⚡ ข้อพิพาทที่ดินผืนงามใจกลางเมือง W-Corp ถูกฟ้องระงับการตอกเสาเข็ม',
      detail: 'ชาวบ้านในพื้นที่ยื่นร้องเรียนเรื่องผลกระทบสิ่งแวดล้อม ศาลสั่งคุ้มครองชั่วคราวให้หยุดงานก่อสร้าง 30 วัน',
      impact: 'negative',
      priceBiasPercent: -14.0
    },
    {
      id: 'wcorp_neg_5',
      symbol: 'WCORP',
      headline: '📰 ข่าวลือผู้บริหารระดับสูงเตรียมขายหุ้นลดสัดส่วนถือครอง',
      detail: 'แม้บริษัทยังไม่ออกมายืนยัน แต่ตลาดยกความกังวลแรงเทขาย Insider Selling ทำเอาราคาหุ้นร่วงลงต่อเนื่อง',
      impact: 'negative',
      priceBiasPercent: -8.5
    }
  ],

  AIL: [
    // Positive (5)
    {
      id: 'ail_pos_1',
      symbol: 'AIL',
      headline: '🚀 AiLuv Inc ปล่อยอัปเดต AI LLM v3.0 บุคลิกตัวละครตอบสนองสมจริงสมบูรณ์แบบ',
      detail: 'ยอดผู้ใช้งานรายวัน (DAU) ทะลุ 10 ล้านคนทั่วโลก ชุมชน AI ให้การตอบรับเกรด A+ นักวิเคราะห์คาดกำไรโตก้าวกระโดด',
      impact: 'positive',
      priceBiasPercent: 18.0
    },
    {
      id: 'ail_pos_2',
      symbol: 'AIL',
      headline: '💡 AiLuv Inc จดสิทธิบัตรเทคโนโลยี Emotional Companion Memory Algorithm',
      detail: 'ระบบจดจำความรู้สึกขั้นสูงช่วยให้ตัวละคร AI จำทุกคำพูดของผู้เล่นได้อย่างแม่นยำ ปิดจุดอ่อนคู่แข่งในตลาดสิ้นเชิง',
      impact: 'positive',
      priceBiasPercent: 14.0
    },
    {
      id: 'ail_pos_3',
      symbol: 'AIL',
      headline: '💰 กองทุน Silicon Venture อัดฉีดเงินลงทุน 100 ล้านดอลลาร์ใน AiLuv Inc',
      detail: 'การประเมินมูลค่าบริษัทพุ่งแตะระดับยูนิคอร์นตัวใหม่ของเมือง นักลงทุนแห่เข้าซื้อหุ้น AIL ร้อนแรงเต็มกระดาน',
      impact: 'positive',
      priceBiasPercent: 16.5
    },
    {
      id: 'ail_pos_4',
      symbol: 'AIL',
      headline: '🌐 AiLuv จับมือแพลตฟอร์มโซเชียลยักษ์ใหญ่ เปิดตัวฟีเจอร์ AI Voice Chat',
      detail: 'ผู้เล่นสามารถคุยเสียงสดกับตัวละครโปรดได้เหมือนจริง ระบบสร้างกระแสไวรัลไปทั่วโซเชียลมีเดีย',
      impact: 'positive',
      priceBiasPercent: 11.0
    },
    {
      id: 'ail_pos_5',
      symbol: 'AIL',
      headline: '📉 ต้นทุน Cloud Server ของ AiLuv ลดลง 40% ด้วยสถาปัตยกรรมชิปใหม่',
      detail: 'ประสิทธิภาพการทำกำไร (Profit Margin) เพิ่มขึ้นทันที ส่งผลให้ราคาเป้าหมายถูกปรับขึ้นจากนักวิเคราะห์วอลสตรีท',
      impact: 'positive',
      priceBiasPercent: 9.0
    },
    // Negative (5)
    {
      id: 'ail_neg_1',
      symbol: 'AIL',
      headline: '🚨 เซิร์ฟเวอร์หลัก AiLuv Inc ล่มนาน 6 ชั่วโมง เหตุทราฟฟิกถั่งโถมมหาศาล',
      detail: 'ผู้ใช้ขัดใจไม่สามารถเชื่อมต่อได้ ส่งผลให้คะแนนแอปพลิเคชันถูกรีวิวติดลบ และเกิดแรงเทขายทำกำไรฉับพลัน',
      impact: 'negative',
      priceBiasPercent: -15.0
    },
    {
      id: 'ail_neg_2',
      symbol: 'AIL',
      headline: '🔒 องค์กรปกป้องข้อมูลความลับเตรียมเข้าตรวจสอบนโยบายความเป็นส่วนตัว AiLuv',
      detail: 'ความกังวลเรื่องการจัดเก็บข้อความแชตของผู้ใช้ ทำให้หุ้นกลุ่ม AI โดนเทขายยกแผงเพื่อลดความเสี่ยงกฎหมาย',
      impact: 'negative',
      priceBiasPercent: -12.5
    },
    {
      id: 'ail_neg_3',
      symbol: 'AIL',
      headline: '🥊 ค่ายเทคคู่แข่งเปิดตัวแอปพลิเคชัน AI Dating เลียนแบบ ฟีเจอร์ตัดราคา',
      detail: 'สงครามราคาในอุตสาหกรรม AI Dating Simulator เริ่มดุเดือดขึ้น ทำให้นักลงทุนกังวลเรื่องการสูญเสียส่วนแบ่งตลาด',
      impact: 'negative',
      priceBiasPercent: -10.0
    },
    {
      id: 'ail_neg_4',
      symbol: 'AIL',
      headline: '💸 ค่าบริการ API LLM ปรับตัวสูงขึ้น กดดันอัตรากำไรขั้นต้นของ AiLuv Inc',
      detail: 'ผู้ให้บริการโมเดลต้นน้ำประกาศปรับเพิ่มค่าการประมวลผล Token ส่งผลกระทบต่อประมาณการกำไรในไตรมาสถัดไป',
      impact: 'negative',
      priceBiasPercent: -8.0
    },
    {
      id: 'ail_neg_5',
      symbol: 'AIL',
      headline: '👨‍💻 หัวหน้าทีมวิศวกร AI ลาออกกะทันหันไปเปิดสตาร์ตอัปของตัวเอง',
      detail: 'กระแสความกังวลเรื่องความต่อเนื่องในการพัฒนาฟีเจอร์ใหม่ ทำให้นักลงทุนขายลดความเสี่ยงชั่วคราว',
      impact: 'negative',
      priceBiasPercent: -11.0
    }
  ],

  ENE: [
    // Positive (5)
    {
      id: 'ene_pos_1',
      symbol: 'ENE',
      headline: '🔥 เครื่องดื่ม Energy Drink รสชาติใหม่ "Super Vibe" กลายเป็นไวรัลทั่วเมือง',
      detail: 'DJ Erin ชื่นชอบและโพสต์ลงโซเชียล สินค้าขาดตลาดในเซเว่นและคาเฟ่ทั่วเมือง ยอดขายพุ่งขึ้น 300%',
      impact: 'positive',
      priceBiasPercent: 13.0
    },
    {
      id: 'ene_pos_2',
      symbol: 'ENE',
      headline: '🎮 Energy Drink Co เซ็นสัญญาเป็นผู้สนับสนุนหลักงานแข่ง E-Sports ระดับโลก',
      detail: 'โลโก้แบรนด์ปรากฏสู่สายตาเกมเมอร์หลายล้านคน ยอดสั่งซื้อล่วงหน้าสำหรับแคมเปญใหม่ทะลุเป้า',
      impact: 'positive',
      priceBiasPercent: 10.5
    },
    {
      id: 'ene_pos_3',
      symbol: 'ENE',
      headline: '🌍 ENE ขยายตลาดส่งออกสู่ภูมิภาคเอเชียตะวันออกเฉียงใต้สำเร็จ',
      detail: 'เซ็นสัญญาคู่ค้ากระจายสินค้าใน 5 ประเทศดันยอดขายต่างประเทศโตกระโดด หุ้นวิ่งรับข่าวบวกสดใส',
      impact: 'positive',
      priceBiasPercent: 11.5
    },
    {
      id: 'ene_pos_4',
      symbol: 'ENE',
      headline: '⚡ เปิดตัวสูตร Sugar-Free แคลอรี 0% เอาใจสายรักสุขภาพและคนออกกำลังกาย',
      detail: 'ฟิตเนสทั่วเมืองสั่งซื้อไปวางจำหน่ายประจำเคาน์เตอร์ ได้รับคำชมเรื่องรสชาติและคุณประโยชน์',
      impact: 'positive',
      priceBiasPercent: 8.5
    },
    {
      id: 'ene_pos_5',
      symbol: 'ENE',
      headline: '🏭 โรงงานบรรจุกระป๋องแห่งใหม่ของ ENE เปิดเดินเครื่องเต็มกำลังการผลิต',
      detail: 'ช่วยลดต้นทุนต่อหน่วยลง 20% และแก้ปัญหาการส่งสินค้าล่าช้า ส่งผลให้อัตราทำกำไรสุทธิสูงขึ้น',
      impact: 'positive',
      priceBiasPercent: 7.0
    },
    // Negative (5)
    {
      id: 'ene_neg_1',
      symbol: 'ENE',
      headline: '⚠️ กระทรวงสาธารณสุขเตรียมคุมเข้มปริมาณ คาเฟอีน ในเครื่องดื่มชูกำลัง',
      detail: 'ข้อเสนอจำกัดการโฆษณาและการขายแก่เยาวชน ทำให้นักลงทุนกังวลเรื่องยอดขายในอนาคต',
      impact: 'negative',
      priceBiasPercent: -11.0
    },
    {
      id: 'ene_neg_2',
      symbol: 'ENE',
      headline: '🍬 ราคาน้ำตาลและวัตถุดิบกระป๋องอลูมิเนียมในตลาดโลกพุ่งสูงขึ้น 25%',
      detail: 'ต้นทุนการผลิตที่เพิ่มขึ้นกะทันหันกดดันสัดส่วนกำไรของบริษัท คาดว่างบปีนี้อาจไม่เติบโตตามเป้า',
      impact: 'negative',
      priceBiasPercent: -9.0
    },
    {
      id: 'ene_neg_3',
      symbol: 'ENE',
      headline: '🚫 ข่าวลือการสั่งเรียกคืนสินค้าล็อตที่มีปัญหาการซีลกระป๋องไม่ได้มาตรฐาน',
      detail: 'แม้กระทบเพียงล็อตเล็กๆ แต่กระทบความเชื่อมั่นของผู้บริโภคและทำให้อัตรากำไรลดลงชั่วคราว',
      impact: 'negative',
      priceBiasPercent: -10.0
    },
    {
      id: 'ene_neg_4',
      symbol: 'ENE',
      headline: '🚛 ปัญหาการขนส่งพนักงานประท้วงหยุดงานที่คลังสินค้าหลัก',
      detail: 'การส่งสินค้าไปยังร้านค้าปลีกชะงักนาน 3 วัน ส่งผลกระทบต่อยอดขายรายสัปดาห์อย่างหลีกเลี่ยงไม่ได้',
      impact: 'negative',
      priceBiasPercent: -8.0
    },
    {
      id: 'ene_neg_5',
      symbol: 'ENE',
      headline: '🥊 แบรนด์เครื่องดื่มต่างชาติเปิดตัวสินค้าราคาประหยัดลงแย่งชิงเค้กการตลาด',
      detail: 'การแข่งขันที่รุนแรงทำให้ ENE ต้องเพิ่มงบการตลาดและโปรโมชัน อัตรากำไรสุทธิจึงถูกกดดัน',
      impact: 'negative',
      priceBiasPercent: -7.5
    }
  ]
};

export function getRandomStockNews(symbol: string): StockNewsItem | undefined {
  const list = STOCK_NEWS_DATABASE[symbol];
  if (!list || list.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * list.length);
  return {
    ...list[randomIndex],
    timestamp: Date.now()
  };
}
