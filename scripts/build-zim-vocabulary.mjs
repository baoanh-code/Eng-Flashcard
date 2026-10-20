import { readFile, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import Papa from 'papaparse'
import { JSDOM } from 'jsdom'

const HEADERS = ['Term', 'IPA', 'PartOfSpeech', 'Definition', 'Example', 'ExampleTranslation', 'Topic', 'Level']
const LEVEL_ORDER = new Map([['A1', 1], ['A2', 2], ['B1', 3], ['B2', 4], ['C1', 5], ['C2', 6]])

const topicMap = new Map([
  ['gia đình', 'People & Family'],
  ['quần áo', 'Clothes'],
  ['môi trường', 'Nature & Environment'],
  ['tính cách', 'People & Relationships'],
  ['cảm xúc', 'People & Relationships'],
  ['mối quan hệ', 'People & Relationships'],
  ['tình yêu', 'People & Relationships'],
  ['đồ ăn', 'Food & Drinks'],
  ['đồ uống', 'Food & Drinks'],
  ['trái cây', 'Food & Drinks'],
  ['rau củ quả', 'Food & Drinks'],
  ['tên các loại hải sản', 'Food & Drinks'],
  ['tên các món ăn việt nam', 'Food & Drinks'],
  ['nấu ăn', 'Food & Drinks'],
  ['sở thích', 'Hobbies & Entertainment'],
  ['âm nhạc', 'Hobbies & Entertainment'],
  ['shopping', 'Shopping'],
  ['du lịch', 'Travel'],
  ['chụp ảnh', 'Hobbies & Entertainment'],
  ['giải trí', 'Hobbies & Entertainment'],
  ['các thể loại phim', 'Hobbies & Entertainment'],
  ['các thể loại sách', 'Hobbies & Entertainment'],
  ['làm đẹp', 'Hobbies & Entertainment'],
  ['các môn thể thao', 'Sports'],
  ['bóng đá', 'Sports'],
  ['nhà cửa', 'Home'],
  ['nhà bếp', 'Home'],
  ['tết', 'Festivals & Celebrations'],
  ['đời sống', 'Daily Life'],
  ['con vật', 'Animals'],
  ['hoa', 'Nature & Environment'],
  ['giáng sinh', 'Festivals & Celebrations'],
  ['màu sắc', 'Colors'],
  ['phương tiện giao thông', 'Transport'],
  ['biển báo giao thông', 'Transport'],
  ['các nghề nghiệp', 'Work & Jobs'],
  ['sức khỏe', 'Health & Body'],
  ['các loại bệnh', 'Health & Body'],
  ['giáo dục', 'School & Education'],
  ['các môn học', 'School & Education'],
  ['kỹ năng', 'School & Education'],
  ['các lễ hội ở việt nam', 'Festivals & Celebrations'],
  ['tết trung thu', 'Festivals & Celebrations'],
  ['trò chơi dân gian', 'Culture & Arts'],
  ['văn hóa', 'Culture & Arts'],
  ['nghệ thuật', 'Culture & Arts'],
  ['kinh doanh', 'Work & Jobs'],
  ['thành phố', 'Places'],
  ['tên các nước', 'Places'],
  ['đời sống công sở', 'Work & Jobs'],
])

function parseArgs() {
  const args = new Map()
  for (let index = 2; index < process.argv.length; index += 1) {
    const key = process.argv[index]
    if (!key.startsWith('--')) continue
    const value = process.argv[index + 1]
    if (!value || value.startsWith('--')) args.set(key, true)
    else {
      args.set(key, value)
      index += 1
    }
  }
  return args
}

function display(value) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanDefinition(value) {
  return display(value)
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/[.;:,]+$/u, '')
}

function lookupKey(value) {
  return display(value)
    .toLocaleLowerCase('en')
    .replace(/^(a|an|the)\s+/u, '')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value) {
  return display(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSourceTopic(value) {
  return display(value).replace(/^Từ vựng về\s+/iu, '').toLocaleLowerCase('vi')
}

function normalizeTerm(value, sourceTopic) {
  let term = display(value)
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/[.;:,]+$/u, '')
    .replace(/^(a|an)\s+/iu, '')
  const preserveCase = /tên các nước/u.test(sourceTopic)
    || /\b(christmas|tet|vietnam|da lat|do son|cau ngu|hung kings|mid-autumn)\b/iu.test(term)
    || /^[A-Z]{2,5}$/.test(term)
  if (!preserveCase) term = term.toLocaleLowerCase('en')
  return term
}

function normalizeIpa(value) {
  let ipa = display(value)
  if (!ipa || /^(n\/?a|none|-+)$/iu.test(ipa)) return ''
  ipa = ipa.replace(/^\[|\]$/g, '').replace(/\s+/g, ' ')
  if (!ipa.startsWith('/')) ipa = `/${ipa}`
  if (!ipa.endsWith('/')) ipa = `${ipa}/`
  return ipa
}

function extractZim(html) {
  const document = new JSDOM(html).window.document
  const headings = [...document.querySelectorAll('#content h3')]
    .filter((heading) => /Từ vựng/iu.test(heading.textContent))
  const rows = []
  const topicCounts = []
  let sourceRow = 0

  for (const heading of headings) {
    let sibling = heading.nextElementSibling
    let table = null
    while (sibling && sibling.tagName !== 'H3') {
      table = sibling.matches('table') ? sibling : sibling.querySelector?.('table')
      if (table) break
      sibling = sibling.nextElementSibling
    }
    if (!table) {
      topicCounts.push({ sourceTopic: display(heading.textContent), rows: 0, anomaly: 'missing table' })
      continue
    }

    const sourceTopicLabel = display(heading.textContent)
    const sourceTopicKey = normalizeSourceTopic(sourceTopicLabel)
    const topic = topicMap.get(sourceTopicKey)
    const tableRows = [...table.querySelectorAll('tr')].slice(1)
    topicCounts.push({ sourceTopic: sourceTopicLabel, rows: tableRows.length, anomaly: topic ? '' : 'unmapped topic' })

    for (const tableRow of tableRows) {
      sourceRow += 1
      const cells = [...tableRow.querySelectorAll('th, td')].map((cell) => display(cell.textContent))
      rows.push({
        SourceRow: sourceRow,
        SourceTopic: sourceTopicLabel,
        RawTerm: cells[0] ?? '',
        RawIPA: cells[1] ?? '',
        RawDefinition: cells[2] ?? '',
        Term: normalizeTerm(cells[0], sourceTopicKey),
        IPA: normalizeIpa(cells[1]),
        Definition: cleanDefinition(cells[2]),
        Topic: topic ?? '',
      })
    }
  }
  return { rows, topicCounts }
}

function parseOxford(html) {
  const document = new JSDOM(html).window.document
  const map = new Map()
  for (const item of document.querySelectorAll('li[data-hw]')) {
    const level = display(item.getAttribute('data-ox3000') || item.getAttribute('data-ox5000')).toUpperCase()
    if (!LEVEL_ORDER.has(level)) continue
    const term = lookupKey(item.getAttribute('data-hw'))
    const pos = display(item.querySelector('.pos')?.textContent).toLocaleLowerCase('en')
    if (!term) continue
    if (!map.has(term)) map.set(term, [])
    map.get(term).push({ level, pos, source: 'Oxford 3000/5000' })
  }
  return map
}

function parseCefrJ(csv) {
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true })
  const map = new Map()
  for (const row of parsed.data) {
    const term = lookupKey(row.headword)
    const level = display(row.CEFR).toUpperCase()
    const pos = display(row.pos).toLocaleLowerCase('en')
    if (!term || !LEVEL_ORDER.has(level)) continue
    if (!map.has(term)) map.set(term, [])
    map.get(term).push({ level, pos, source: 'CEFR-J 1.5' })
  }
  return map
}

function normalizePos(pos) {
  const value = display(pos).toLocaleLowerCase('en')
  const aliases = [
    [/^n(oun)?\.?$/u, 'noun'],
    [/^v(erb)?\.?$/u, 'verb'],
    [/^adj(ective)?\.?$/u, 'adjective'],
    [/^adv(erb)?\.?$/u, 'adverb'],
    [/^prep(osition)?\.?$/u, 'preposition'],
    [/^pron(oun)?\.?$/u, 'pronoun'],
    [/^conj(unction)?\.?$/u, 'conjunction'],
    [/^det(erminer)?\.?$/u, 'determiner'],
    [/^exclamation$/u, 'exclamation'],
    [/^number$/u, 'number'],
  ]
  for (const [pattern, normalized] of aliases) if (pattern.test(value)) return normalized
  return value || ''
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function classify(term, oxford, cefrJ) {
  const key = lookupKey(term)
  const oxfordEntries = oxford.get(key) ?? []
  const cefrEntries = cefrJ.get(key) ?? []
  const allEntries = oxfordEntries.length ? oxfordEntries : cefrEntries
  const levels = unique(allEntries.map((entry) => entry.level))
  const parts = unique(allEntries.map((entry) => normalizePos(entry.pos)))
  const reference = oxfordEntries.length ? 'Oxford 3000/5000' : cefrEntries.length ? 'CEFR-J 1.5' : ''

  if (levels.length === 1 && ['A1', 'A2', 'B1', 'B2'].includes(levels[0])) {
    return {
      level: levels[0],
      partOfSpeech: parts.length === 1 ? parts[0] : term.includes(' ') ? 'phrase' : '',
      classificationSource: reference,
      classificationNote: '',
    }
  }

  if (levels.length > 1) {
    const cefrLevels = unique(cefrEntries.map((entry) => entry.level))
    if (cefrLevels.length === 1 && levels.includes(cefrLevels[0]) && ['A1', 'A2', 'B1', 'B2'].includes(cefrLevels[0])) {
      const matchingParts = unique(cefrEntries.map((entry) => normalizePos(entry.pos)))
      return {
        level: cefrLevels[0],
        partOfSpeech: matchingParts.length === 1 ? matchingParts[0] : term.includes(' ') ? 'phrase' : '',
        classificationSource: 'CEFR-J 1.5 (Oxford sense-level ambiguity)',
        classificationNote: `Oxford levels: ${levels.join(', ')}`,
      }
    }
    return {
      level: 'REVIEW',
      partOfSpeech: parts.length === 1 ? parts[0] : term.includes(' ') ? 'phrase' : '',
      classificationSource: reference,
      classificationNote: `Ambiguous reference levels: ${levels.join(', ')}`,
    }
  }

  return {
    level: 'REVIEW',
    partOfSpeech: term.includes(' ') ? 'phrase' : '',
    classificationSource: reference,
    classificationNote: levels.length ? `Outside supported range: ${levels.join(', ')}` : 'No exact CEFR reference match',
  }
}

const A2_EXAMPLES = new Map([
  ['Animals::monkey', ['The monkey is eating a banana.', 'Con khỉ đang ăn một quả chuối.']],
  ['Animals::spider', ['There is a spider near the window.', 'Có một con nhện gần cửa sổ.']],
  ['Clothes::pants', ['These pants are too long for me.', 'Chiếc quần này quá dài đối với tôi.']],
  ['Clothes::swimsuit', ['She packed her swimsuit for the beach.', 'Cô ấy đã xếp đồ bơi để đi biển.']],
  ['Colors::gold', ['She wore a gold dress to the party.', 'Cô ấy mặc một chiếc váy màu vàng óng đến bữa tiệc.']],
  ['Colors::silver', ['His new bicycle is silver.', 'Chiếc xe đạp mới của anh ấy có màu bạc.']],
  ['Culture & Arts::brush', ['I use a small brush to paint.', 'Tôi dùng một cây cọ nhỏ để vẽ.']],
  ['Culture & Arts::drawing', ['Her drawing is on the classroom wall.', 'Bức vẽ của cô ấy ở trên tường lớp học.']],
  ['Culture & Arts::gallery', ['We visited an art gallery on Sunday.', 'Chúng tôi đã thăm một phòng trưng bày nghệ thuật vào Chủ nhật.']],
  ['Culture & Arts::tradition', ['This family tradition is very important to us.', 'Truyền thống gia đình này rất quan trọng với chúng tôi.']],
  ['Daily Life::lifestyle', ['Walking every day is part of a healthy lifestyle.', 'Đi bộ mỗi ngày là một phần của lối sống lành mạnh.']],
  ['Daily Life::stress', ['Exercise can help reduce stress.', 'Tập thể dục có thể giúp giảm căng thẳng.']],
  ['Festivals & Celebrations::tradition', ['Giving lucky money is a Tet tradition.', 'Lì xì là một truyền thống ngày Tết.']],
  ['Festivals & Celebrations::traditional', ['We eat traditional food during Tet.', 'Chúng tôi ăn món truyền thống trong dịp Tết.']],
  ['Food & Drinks::champagne', ['They opened a bottle of champagne at the party.', 'Họ mở một chai rượu sâm banh tại bữa tiệc.']],
  ['Food & Drinks::dessert', ['We had fruit for dessert.', 'Chúng tôi ăn trái cây làm món tráng miệng.']],
  ['Food & Drinks::garlic', ['Add some garlic to the soup.', 'Hãy thêm một ít tỏi vào món súp.']],
  ['Food & Drinks::knife', ['Please cut the bread with this knife.', 'Hãy cắt bánh mì bằng con dao này.']],
  ['Food & Drinks::lemon', ['She put a slice of lemon in her tea.', 'Cô ấy cho một lát chanh vào trà.']],
  ['Food & Drinks::lemonade', ['I made cold lemonade for everyone.', 'Tôi làm nước chanh lạnh cho mọi người.']],
  ['Food & Drinks::pear', ['He ate a pear after lunch.', 'Anh ấy ăn một quả lê sau bữa trưa.']],
  ['Food & Drinks::recipe', ['This recipe is easy to follow.', 'Công thức này rất dễ làm theo.']],
  ['Food & Drinks::soda', ['He ordered a soda with his meal.', 'Anh ấy gọi một ly nước có ga cùng bữa ăn.']],
  ['Food & Drinks::soft drink', ['Would you like a soft drink?', 'Bạn có muốn một ly nước ngọt không?']],
  ['Health & Body::headache', ['I have a headache, so I need to rest.', 'Tôi bị đau đầu nên cần nghỉ ngơi.']],
  ['Health & Body::medicine', ['Take this medicine after breakfast.', 'Hãy uống thuốc này sau bữa sáng.']],
  ['Health & Body::stomachache', ['She stayed home because she had a stomachache.', 'Cô ấy ở nhà vì bị đau bụng.']],
  ['Health & Body::stress', ['Too much stress can make you tired.', 'Quá nhiều căng thẳng có thể khiến bạn mệt mỏi.']],
  ['Hobbies & Entertainment::adventure', ['Our camping trip was a great adventure.', 'Chuyến cắm trại của chúng tôi là một cuộc phiêu lưu tuyệt vời.']],
  ['Hobbies & Entertainment::attractive', ['The poster is simple but attractive.', 'Tấm áp phích đơn giản nhưng hấp dẫn.']],
  ['Hobbies & Entertainment::audience', ['The audience clapped at the end of the show.', 'Khán giả vỗ tay khi buổi diễn kết thúc.']],
  ['Hobbies & Entertainment::climbing', ['Climbing is her favourite weekend activity.', 'Leo núi là hoạt động cuối tuần yêu thích của cô ấy.']],
  ['Hobbies & Entertainment::comedy', ['We watched a comedy and laughed a lot.', 'Chúng tôi xem một bộ phim hài và cười rất nhiều.']],
  ['Hobbies & Entertainment::crime', ['He is reading a story about a crime.', 'Anh ấy đang đọc một câu chuyện về một vụ phạm tội.']],
  ['Hobbies & Entertainment::cycling', ['I go cycling with my friends on Sundays.', 'Tôi đi xe đạp cùng bạn bè vào Chủ nhật.']],
  ['Hobbies & Entertainment::develop', ['This shop can develop your photos.', 'Cửa hàng này có thể rửa ảnh cho bạn.']],
  ['Hobbies & Entertainment::drama', ['My sister enjoys watching drama series.', 'Chị tôi thích xem phim truyền hình.']],
  ['Hobbies & Entertainment::drawing', ['Drawing helps me relax after school.', 'Vẽ giúp tôi thư giãn sau giờ học.']],
  ['Hobbies & Entertainment::fiction', ['She likes reading science fiction.', 'Cô ấy thích đọc truyện khoa học viễn tưởng.']],
  ['Hobbies & Entertainment::fishing', ['We went fishing by the lake.', 'Chúng tôi đi câu cá bên hồ.']],
  ['Hobbies & Entertainment::focus', ['Press this button to focus the camera.', 'Nhấn nút này để lấy nét máy ảnh.']],
  ['Hobbies & Entertainment::hiking', ['We went hiking in the mountains.', 'Chúng tôi đi bộ đường dài trên núi.']],
  ['Hobbies & Entertainment::instrument', ['Can you play a musical instrument?', 'Bạn có biết chơi một nhạc cụ không?']],
  ['Hobbies & Entertainment::violin', ['She plays the violin in the school band.', 'Cô ấy chơi đàn vi-ô-lông trong ban nhạc của trường.']],
  ['Hobbies & Entertainment::voice', ['He has a clear singing voice.', 'Anh ấy có giọng hát trong trẻo.']],
  ['Hobbies & Entertainment::war', ['The film tells a story about the war.', 'Bộ phim kể một câu chuyện về chiến tranh.']],
  ['Home::balcony', ['We grow flowers on the balcony.', 'Chúng tôi trồng hoa trên ban công.']],
  ['Home::bowl', ['Please put the fruit in this bowl.', 'Hãy đặt trái cây vào chiếc tô này.']],
  ['Home::fork', ['I need a fork to eat this salad.', 'Tôi cần một cái nĩa để ăn món salad này.']],
  ['Home::furniture', ['We bought new furniture for the living room.', 'Chúng tôi mua nội thất mới cho phòng khách.']],
  ['Home::knife', ['The knife is next to the cutting board.', 'Con dao ở cạnh thớt.']],
  ['Home::oven', ['The cake is baking in the oven.', 'Chiếc bánh đang được nướng trong lò.']],
  ['Home::plate', ['Please put your plate on the table.', 'Hãy đặt chiếc đĩa của bạn lên bàn.']],
  ['Home::refrigerator', ['The milk is in the refrigerator.', 'Sữa ở trong tủ lạnh.']],
  ['Home::roof', ['The workers are repairing the roof.', 'Những người thợ đang sửa mái nhà.']],
  ['Home::spoon', ['She stirred her tea with a spoon.', 'Cô ấy khuấy trà bằng một chiếc thìa.']],
  ['Home::stove', ['The soup is cooking on the stove.', 'Món súp đang được nấu trên bếp.']],
  ['Nature & Environment::climate', ['This area has a warm climate.', 'Khu vực này có khí hậu ấm áp.']],
  ['Nature & Environment::environment', ['We should protect the environment.', 'Chúng ta nên bảo vệ môi trường.']],
  ['Nature & Environment::sunflower', ['A tall sunflower grows beside the fence.', 'Một cây hoa hướng dương cao mọc cạnh hàng rào.']],
  ['People & Family::grandchild', ['Their grandchild visits them every weekend.', 'Cháu của họ đến thăm họ mỗi cuối tuần.']],
  ['People & Family::granddaughter', ['My granddaughter loves drawing.', 'Cháu gái của tôi thích vẽ.']],
  ['People & Family::grandson', ['Her grandson is learning to swim.', 'Cháu trai của bà ấy đang học bơi.']],
  ['People & Family::twin', ['My twin and I look very similar.', 'Tôi và người em sinh đôi trông rất giống nhau.']],
  ['People & Relationships::amused', ['The children were amused by the funny story.', 'Bọn trẻ thấy vui vì câu chuyện hài hước.']],
  ['People & Relationships::charity', ['We gave some clothes to charity.', 'Chúng tôi quyên góp một ít quần áo cho tổ chức từ thiện.']],
  ['People & Relationships::reunion', ['Our family reunion is next Sunday.', 'Buổi họp mặt gia đình của chúng tôi diễn ra vào Chủ nhật tới.']],
  ['People & Relationships::surprised', ['I was surprised by the birthday party.', 'Tôi bất ngờ vì bữa tiệc sinh nhật.']],
  ['People & Relationships::wedding', ['They invited us to their wedding.', 'Họ mời chúng tôi đến dự đám cưới.']],
  ['School & Education::biology', ['We learn about plants in biology.', 'Chúng tôi học về thực vật trong môn sinh học.']],
  ['School & Education::chemistry', ['We did a simple experiment in chemistry.', 'Chúng tôi làm một thí nghiệm đơn giản trong môn hóa học.']],
  ['School & Education::degree', ['She has a degree in education.', 'Cô ấy có bằng cấp về giáo dục.']],
  ['School & Education::knowledge', ['Reading books can increase your knowledge.', 'Đọc sách có thể mở rộng kiến thức của bạn.']],
  ['School & Education::learning', ['Learning a language takes time.', 'Việc học một ngôn ngữ cần có thời gian.']],
  ['School & Education::lecture', ["The lecture starts at ten o'clock.", 'Bài giảng bắt đầu lúc mười giờ.']],
  ['School & Education::mathematics', ['Mathematics is my favourite subject.', 'Toán học là môn học yêu thích của tôi.']],
  ['School & Education::physics', ['We study light and sound in physics.', 'Chúng tôi học về ánh sáng và âm thanh trong môn vật lý.']],
  ['School & Education::research', ['The students are doing research for a project.', 'Các học sinh đang nghiên cứu cho một dự án.']],
  ['Shopping::aisle', ['The milk is in the next aisle.', 'Sữa ở lối đi tiếp theo.']],
  ['Shopping::sale', ['This jacket is on sale today.', 'Chiếc áo khoác này đang được giảm giá hôm nay.']],
  ['Shopping::size', ['Do you have this shirt in a larger size?', 'Bạn có chiếc áo này với kích cỡ lớn hơn không?']],
  ['Sports::athlete', ['The athlete trains every morning.', 'Vận động viên tập luyện mỗi sáng.']],
  ['Sports::competition', ['Our team won the school competition.', 'Đội của chúng tôi đã thắng cuộc thi ở trường.']],
  ['Sports::corner', ['The referee gave our team a corner.', 'Trọng tài cho đội chúng tôi hưởng một quả phạt góc.']],
  ['Sports::equipment', ['We keep the sports equipment in this room.', 'Chúng tôi cất thiết bị thể thao trong phòng này.']],
  ['Sports::goal', ['She scored a goal in the second half.', 'Cô ấy ghi một bàn thắng trong hiệp hai.']],
  ['Sports::pass', ['He made a quick pass to his teammate.', 'Anh ấy chuyền bóng nhanh cho đồng đội.']],
  ['Sports::record', ['She broke the school swimming record.', 'Cô ấy phá kỷ lục bơi của trường.']],
  ['Transport::bus stop', ['I wait for the bus at this bus stop.', 'Tôi đợi xe buýt tại bến xe buýt này.']],
  ['Transport::motorcycle', ['He rides his motorcycle to work.', 'Anh ấy đi xe máy đến nơi làm việc.']],
  ['Transport::traffic light', ['Turn left after the traffic light.', 'Rẽ trái sau đèn giao thông.']],
  ['Transport::tram', ['We took the tram to the city centre.', 'Chúng tôi đi xe điện đến trung tâm thành phố.']],
  ['Transport::truck', ['A large truck stopped outside the shop.', 'Một chiếc xe tải lớn dừng bên ngoài cửa hàng.']],
  ['Transport::van', ['The hotel sent a van to pick us up.', 'Khách sạn cử một chiếc xe van đến đón chúng tôi.']],
  ['Travel::adventure', ['Travelling alone can be a real adventure.', 'Đi du lịch một mình có thể là một cuộc phiêu lưu thực sự.']],
  ['Travel::guide', ['Our guide showed us around the old town.', 'Hướng dẫn viên dẫn chúng tôi tham quan khu phố cổ.']],
  ['Travel::sightseeing', ['We spent the morning sightseeing.', 'Chúng tôi dành buổi sáng để tham quan.']],
  ['Work & Jobs::advertising', ['She works in advertising.', 'Cô ấy làm việc trong ngành quảng cáo.']],
  ['Work & Jobs::architect', ['The architect designed our new school.', 'Kiến trúc sư đã thiết kế ngôi trường mới của chúng tôi.']],
  ['Work & Jobs::astronaut', ['The astronaut returned safely to Earth.', 'Phi hành gia đã trở về Trái Đất an toàn.']],
  ['Work & Jobs::chef', ['The chef is preparing dinner.', 'Đầu bếp đang chuẩn bị bữa tối.']],
  ['Work & Jobs::colleague', ['I had lunch with a colleague.', 'Tôi ăn trưa cùng một đồng nghiệp.']],
  ['Work & Jobs::competition', ['There is strong competition between the two shops.', 'Có sự cạnh tranh mạnh giữa hai cửa hàng.']],
  ['Work & Jobs::conference', ['Our manager is at a conference today.', 'Quản lý của chúng tôi đang dự một hội nghị hôm nay.']],
  ['Work & Jobs::engineer', ['The engineer checked the machine.', 'Kỹ sư đã kiểm tra chiếc máy.']],
  ['Work & Jobs::lawyer', ['She spoke to a lawyer about the problem.', 'Cô ấy nói chuyện với luật sư về vấn đề đó.']],
  ['Work & Jobs::manager', ['The manager called a short meeting.', 'Quản lý đã tổ chức một cuộc họp ngắn.']],
  ['Work & Jobs::police officer', ['A police officer helped us cross the road.', 'Một cảnh sát giúp chúng tôi qua đường.']],
  ['Work & Jobs::printer', ['The printer is out of paper.', 'Máy in đã hết giấy.']],
  ['Work & Jobs::strategy', ['We need a clear strategy for the project.', 'Chúng tôi cần một chiến lược rõ ràng cho dự án.']],
])

function createExample(record) {
  const key = `${record.Topic}::${lookupKey(record.Term)}`
  const example = A2_EXAMPLES.get(key)
  if (!example) throw new Error(`Missing reviewed A2 example for ${key}`)
  return example
}

function groupBy(values, getKey) {
  const map = new Map()
  for (const value of values) {
    const key = getKey(value)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(value)
  }
  return map
}

function buildCleanRows(rawRows, oxford, cefrJ) {
  const usable = rawRows.filter((row) => row.Term && row.Definition && row.Topic)
  const groups = groupBy(usable, (row) => `${slugify(row.Topic)}::${lookupKey(row.Term)}`)
  const cleanRows = []
  for (const rows of groups.values()) {
    const first = rows[0]
    const classification = classify(first.Term, oxford, cefrJ)
    const record = {
      Term: first.Term,
      IPA: unique(rows.map((row) => row.IPA))[0] ?? '',
      PartOfSpeech: classification.partOfSpeech,
      Definition: unique(rows.map((row) => row.Definition)).join(' / '),
      Example: '',
      ExampleTranslation: '',
      Topic: first.Topic,
      Level: classification.level,
      SourceTopics: unique(rows.map((row) => row.SourceTopic)).join(' | '),
      SourceRows: rows.map((row) => row.SourceRow).join(' | '),
      ClassificationSource: classification.classificationSource,
      ClassificationNote: classification.classificationNote,
    }
    if (record.Level === 'A2') [record.Example, record.ExampleTranslation] = createExample(record)
    cleanRows.push(record)
  }
  return cleanRows.sort((a, b) => a.Topic.localeCompare(b.Topic, 'en') || a.Term.localeCompare(b.Term, 'en'))
}

function csvText(rows, headers) {
  return `\uFEFF${Papa.unparse(rows, { columns: headers, newline: '\r\n' })}\r\n`
}

async function writeCsv(filePath, rows, headers) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, csvText(rows, headers), 'utf8')
}

function makeDuplicateRows(rawRows) {
  const groups = groupBy(rawRows.filter((row) => row.Term), (row) => lookupKey(row.Term))
  return [...groups.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([term, rows]) => ({
      Term: term,
      Topics: unique(rows.map((row) => row.SourceTopic)).join(' | '),
      NormalizedTopics: unique(rows.map((row) => row.Topic)).join(' | '),
      Count: rows.length,
      SourceRows: rows.map((row) => row.SourceRow).join(' | '),
      RecommendedResolution: unique(rows.map((row) => row.Topic)).length === 1
        ? 'Merge duplicate rows inside the normalized topic after checking meanings.'
        : 'Retain cross-topic senses unless a manual review confirms they are identical.',
    }))
    .sort((a, b) => b.Count - a.Count || a.Term.localeCompare(b.Term, 'en'))
}

function makeNearDuplicateRows(rawRows) {
  const terms = [...groupBy(rawRows.filter((row) => row.Term), (row) => lookupKey(row.Term)).entries()]
  const results = []
  for (let leftIndex = 0; leftIndex < terms.length; leftIndex += 1) {
    const [left, leftRows] = terms[leftIndex]
    for (let rightIndex = leftIndex + 1; rightIndex < terms.length; rightIndex += 1) {
      const [right, rightRows] = terms[rightIndex]
      const leftCompact = left.replace(/[^a-z0-9]/gu, '')
      const rightCompact = right.replace(/[^a-z0-9]/gu, '')
      const punctuationVariant = leftCompact && leftCompact === rightCompact
      const singularPluralVariant = `${left}s` === right || `${right}s` === left
        || (left.endsWith('y') && `${left.slice(0, -1)}ies` === right)
        || (right.endsWith('y') && `${right.slice(0, -1)}ies` === left)
      if (!punctuationVariant && !singularPluralVariant) continue
      results.push({
        Terms: `${left} | ${right}`,
        Topics: unique([...leftRows, ...rightRows].map((row) => row.SourceTopic)).join(' | '),
        VariantType: punctuationVariant ? 'punctuation-or-spacing' : 'singular-or-plural',
        RecommendedResolution: 'Review meanings and source contexts; merge only when the entries represent the same learning item.',
      })
    }
  }
  return results.sort((a, b) => a.Terms.localeCompare(b.Terms, 'en'))
}

function canonicalRow(row) {
  return Object.fromEntries(HEADERS.map((header) => [header, row[header] ?? '']))
}

function buildStats(extraction, cleanRows, duplicateRows, nearDuplicateRows) {
  const rawRows = extraction.rows
  const rawFullKeys = new Set(rawRows.map((row) => [lookupKey(row.Term), row.IPA, row.Definition, row.SourceTopic].join('::')))
  const uniqueTerms = new Set(rawRows.filter((row) => row.Term).map((row) => lookupKey(row.Term)))
  const duplicateOccurrences = duplicateRows.reduce((sum, row) => sum + row.Count - 1, 0)
  const levelCounts = Object.fromEntries(['A1', 'A2', 'B1', 'B2', 'REVIEW'].map((level) => [level, cleanRows.filter((row) => row.Level === level).length]))
  const a2Rows = cleanRows.filter((row) => row.Level === 'A2')
  const a2ByTopic = Object.fromEntries([...groupBy(a2Rows, (row) => row.Topic)].map(([topic, rows]) => [topic, rows.length]))
  return {
    rawSourceRows: rawRows.length,
    expectedSourceRows: 1000,
    coveragePercentage: Number((rawRows.length / 1000 * 100).toFixed(1)),
    sourceTopicCount: extraction.topicCounts.length,
    normalizedTopicCount: new Set(rawRows.map((row) => row.Topic).filter(Boolean)).size,
    uniqueTerms: uniqueTerms.size,
    duplicateRows: rawRows.length - rawFullKeys.size,
    duplicateTerms: duplicateRows.length,
    duplicateOccurrences,
    suspiciousNearDuplicateGroups: nearDuplicateRows.length,
    skippedRows: rawRows.filter((row) => !row.Term || !row.Definition || !row.Topic).length,
    malformedRows: rawRows.filter((row) => !row.Term || !row.Definition || !row.Topic).length,
    missingDefinitionRows: rawRows.filter((row) => !row.Definition).length,
    missingIpaRows: rawRows.filter((row) => !row.IPA).length,
    missingPartOfSpeech: cleanRows.filter((row) => !row.PartOfSpeech).length,
    suspiciousIpa: rawRows.filter((row) => row.IPA && (!row.IPA.startsWith('/') || !row.IPA.endsWith('/'))).length,
    cleanRows: cleanRows.length,
    levelCounts,
    a2Rows: a2Rows.length,
    a2TopicCount: Object.keys(a2ByTopic).length,
    a2ByTopic,
  }
}

function reportMarkdown(stats, extraction, cleanRows, duplicateRows) {
  const uncertain = cleanRows.filter((row) => row.Level === 'REVIEW')
  const topicTable = extraction.topicCounts.map((topic) => `| ${topic.sourceTopic} | ${topic.rows} | ${topic.anomaly || 'OK'} |`).join('\n')
  const a2Table = Object.entries(stats.a2ByTopic).map(([topic, count]) => `| ${topic} | ${count} |`).join('\n') || '| None | 0 |'
  const levels = Object.entries(stats.levelCounts).map(([level, count]) => `| ${level} | ${count} |`).join('\n')
  const reviewSample = uncertain.slice(0, 100).map((row) => `| ${row.Term} | ${row.Topic} | ${row.ClassificationNote} |`).join('\n') || '| None | - | - |'
  return `# ZIM 1000 vocabulary extraction and validation report

Generated: ${new Date().toISOString()}

Primary source: https://zim.vn/1000-tu-vung-tieng-anh-theo-chu-de

CEFR references:
- Oxford 3000/5000 word lists: https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000
- CEFR-J Vocabulary Profile 1.5: https://github.com/openlanguageprofiles/olp-en-cefrj

## Source coverage

- Raw source rows: **${stats.rawSourceRows}**
- Advertised source count: **${stats.expectedSourceRows}**
- Coverage against advertised count: **${stats.coveragePercentage}%**
- Source topics: **${stats.sourceTopicCount}**
- Normalized production topics: **${stats.normalizedTopicCount}**
- Coverage conclusion: all ${stats.sourceTopicCount} vocabulary headings on the downloaded page were paired with a table. The page currently contains ${stats.rawSourceRows - stats.expectedSourceRows} more rows than its advertised rounded count; no entries were fabricated or removed to force exactly 1,000.

| Source topic | Rows | Extraction status |
| --- | ---: | --- |
${topicTable}

## Cleaning

- Clean rows after same-topic consolidation: **${stats.cleanRows}**
- Unique normalized terms across all topics: **${stats.uniqueTerms}**
- Exact duplicate rows: **${stats.duplicateRows}**
- Terms appearing more than once: **${stats.duplicateTerms}**
- Duplicate occurrences beyond the first: **${stats.duplicateOccurrences}**
- Suspicious punctuation/spacing or singular/plural groups: **${stats.suspiciousNearDuplicateGroups}**
- Malformed rows: **${stats.malformedRows}**
- Skipped rows: **${stats.skippedRows}**

Cross-topic duplicates remain in the clean master. Same normalized term + normalized topic rows are consolidated with source rows and source topics retained for traceability.

## Field quality

- Missing IPA rows: **${stats.missingIpaRows}**
- Missing definition rows: **${stats.missingDefinitionRows}**
- Missing PartOfSpeech after reference lookup: **${stats.missingPartOfSpeech}**
- Suspicious normalized IPA rows: **${stats.suspiciousIpa}**
- Ambiguous or unmatched CEFR rows: **${stats.levelCounts.REVIEW}**

## CEFR distribution

| Level | Clean rows |
| --- | ---: |
${levels}

Classification is conservative. Exact Oxford matches are preferred; CEFR-J is used when Oxford has no exact entry or to resolve a documented Oxford sense-level ambiguity. C1/C2-only, missing, or unresolved multi-level matches are retained as REVIEW rather than downgraded.

## A2 candidate output

- A2 terms: **${stats.a2Rows}**
- A2 topics: **${stats.a2TopicCount}**
- Examples: original, manually reviewed project sentences with Vietnamese translations; no ZIM examples were copied.
- Production status: **candidate only**. Current app vocabulary was not replaced.

| Topic | A2 terms |
| --- | ---: |
${a2Table}

## Duplicate review

The exact duplicate inventory is in \`master/zim-1000-duplicates.csv\`, and high-confidence punctuation/spacing or singular/plural candidates are in \`master/zim-1000-near-duplicates.csv\`. ${duplicateRows.length} normalized terms require duplicate awareness; cross-topic entries were not silently deleted.

## Manual review queue (first 100)

| Term | Topic | Reason |
| --- | --- | --- |
${reviewSample}

The complete queue is in \`review/uncertain.csv\`.

## Safe promotion procedure

1. Review \`review/uncertain.csv\`, duplicate conflicts, and a sample of every A2 topic's generated examples.
2. Run \`node scripts/validate-vocabulary-candidate.mjs\`.
3. Extend \`src/data/topics/a2.js\` with the approved candidate topic metadata.
4. Back up the current three sample files, then copy approved files from \`data/zim-1000/vocabulary/a2/\` into \`src/data/vocabulary/a2/\`.
5. Run \`npm run validate:data\`, unit tests, browser tests, and production build before release.
`
}

async function main() {
  const args = parseArgs()
  const zimPath = path.resolve(String(args.get('--zim-html') || path.join(process.env.TEMP ?? '.', 'zim-vocabulary-source.html')))
  const oxfordPath = path.resolve(String(args.get('--oxford-html') || path.join(process.env.TEMP ?? '.', 'oxford-wordlists.html')))
  const cefrPath = path.resolve(String(args.get('--cefrj-csv') || path.join(process.env.TEMP ?? '.', 'cefrj-vocabulary-profile.csv')))
  const outputRoot = path.resolve(String(args.get('--output') || 'data/zim-1000'))
  const reportPath = path.resolve(String(args.get('--report') || 'plans/reports/zim-1000-vocabulary-report.md'))
  const dryRun = args.has('--dry-run')

  const [zimHtml, oxfordHtml, cefrCsv] = await Promise.all([
    readFile(zimPath, 'utf8'),
    readFile(oxfordPath, 'utf8'),
    readFile(cefrPath, 'utf8'),
  ])
  const extraction = extractZim(zimHtml)
  const oxford = parseOxford(oxfordHtml)
  const cefrJ = parseCefrJ(cefrCsv)
  const cleanRows = buildCleanRows(extraction.rows, oxford, cefrJ)
  const duplicateRows = makeDuplicateRows(extraction.rows)
  const nearDuplicateRows = makeNearDuplicateRows(extraction.rows)
  const stats = buildStats(extraction, cleanRows, duplicateRows, nearDuplicateRows)

  console.log(JSON.stringify({
    source: { rows: stats.rawSourceRows, topics: stats.sourceTopicCount, coverage: stats.coveragePercentage },
    clean: { rows: stats.cleanRows, uniqueTerms: stats.uniqueTerms, duplicateTerms: stats.duplicateTerms },
    levels: stats.levelCounts,
    a2: { rows: stats.a2Rows, topics: stats.a2TopicCount },
  }, null, 2))
  if (dryRun) return

  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })
  const rawHeaders = ['SourceRow', 'SourceTopic', 'RawTerm', 'RawIPA', 'RawDefinition', 'Term', 'IPA', 'Definition', 'Topic']
  const cleanHeaders = [...HEADERS, 'SourceTopics', 'SourceRows', 'ClassificationSource', 'ClassificationNote']
  await writeCsv(path.join(outputRoot, 'master', 'zim-1000-raw.csv'), extraction.rows, rawHeaders)
  await writeCsv(path.join(outputRoot, 'master', 'zim-1000-clean.csv'), cleanRows, cleanHeaders)
  await writeCsv(path.join(outputRoot, 'master', 'zim-1000-duplicates.csv'), duplicateRows, ['Term', 'Topics', 'NormalizedTopics', 'Count', 'SourceRows', 'RecommendedResolution'])
  await writeCsv(path.join(outputRoot, 'master', 'zim-1000-near-duplicates.csv'), nearDuplicateRows, ['Terms', 'Topics', 'VariantType', 'RecommendedResolution'])

  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    const levelRows = cleanRows.filter((row) => row.Level === level)
    for (const [topic, rows] of groupBy(levelRows, (row) => row.Topic)) {
      await writeCsv(path.join(outputRoot, 'vocabulary', level.toLocaleLowerCase('en'), `${slugify(topic)}.csv`), rows.map(canonicalRow), HEADERS)
    }
  }
  const reviewRows = cleanRows.filter((row) => row.Level === 'REVIEW').map((row) => ({
    ...canonicalRow(row),
    SourceTopics: row.SourceTopics,
    ClassificationSource: row.ClassificationSource,
    ReviewReason: row.ClassificationNote,
  }))
  await writeCsv(path.join(outputRoot, 'review', 'uncertain.csv'), reviewRows, [...HEADERS, 'SourceTopics', 'ClassificationSource', 'ReviewReason'])

  const a2Topics = [...groupBy(cleanRows.filter((row) => row.Level === 'A2'), (row) => row.Topic).entries()]
    .map(([name]) => ({ id: slugify(name), level: 'a2', name, description: `Từ vựng A2 về ${name}.`, sourceAliases: [slugify(name)], nameAliases: [] }))
  await writeFile(path.join(outputRoot, 'topics.a2.json'), `${JSON.stringify(a2Topics, null, 2)}\n`, 'utf8')
  await writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    sourceUrl: 'https://zim.vn/1000-tu-vung-tieng-anh-theo-chu-de',
    stats,
    sourceTopics: extraction.topicCounts,
  }, null, 2)}\n`, 'utf8')
  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, reportMarkdown(stats, extraction, cleanRows, duplicateRows), 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
