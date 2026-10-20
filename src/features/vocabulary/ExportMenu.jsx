import { Download } from 'lucide-react'
import { Button } from '../../components/ui/Button.jsx'
import { downloadText } from '../../services/downloadFile.js'
import { exportFilename, serializeVocabulary } from '../../services/vocabularyExport.js'

export function ExportMenu({ levelId, records, topicId }) {
  function download(format) { downloadText(serializeVocabulary(records, format), exportFilename(levelId, topicId, format), format) }
  return <div className="button-row export-actions"><Button onClick={() => download('csv')} variant="secondary"><Download aria-hidden="true" size={17} />Tải CSV</Button><Button onClick={() => download('tsv')} variant="secondary"><Download aria-hidden="true" size={17} />Tải TSV</Button></div>
}
