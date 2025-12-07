import React, { useState, useRef, useEffect } from 'react'
import './VoiceRecorder.scss'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

const VoiceRecorder: React.FC = () => {
  const [text, setText] = useState<string>('')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isSupported, setIsSupported] = useState<boolean>(true)
  const [transcript, setTranscript] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ru-RU'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsRecording(true)
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        let currentTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            setText(prev => {
              const separator = prev && !prev.endsWith('. ') && !prev.endsWith('! ') && !prev.endsWith('? ') ? '. ' : ''
              return prev + separator + transcriptPart + ' '
            })
            setTranscript('')
          } else {
            currentTranscript = transcriptPart
          }
        }
        
        if (currentTranscript) {
          setTranscript(currentTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Ошибка распознавания речи:', event.error)
        if (event.error === 'not-allowed') {
          alert('Доступ к микрофону запрещен. Пожалуйста, разрешите использование микрофона в настройках браузера.')
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        setTranscript('')
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const startRecording = () => {
    if (!isSupported) {
      alert('Ваш браузер не поддерживает распознавание речи. Пожалуйста, используйте Chrome или Edge.')
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Не удалось начать запись:', error)
        setIsRecording(false)
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Не удалось остановить запись:', error)
      }
    }
    setIsRecording(false)
  }

  const exportToDocx = async () => {
    if (!text.trim()) {
      alert('Нет текста для экспорта')
      return
    }

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Голосовые заметки",
              heading: HeadingLevel.TITLE,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Создано: ${new Date().toLocaleString('ru-RU')}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  size: 24,
                }),
              ],
            }),
          ],
        }],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `voice_notes_${new Date().getTime()}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Ошибка при создании DOCX:', error)
      alert('Ошибка при создании файла. Попробуйте еще раз.')
    }
  }

  const exportToTxt = () => {
    if (!text.trim()) {
      alert('Нет текста для экспорта')
      return
    }

    const content = `Голосовые заметки\nСоздано: ${new Date().toLocaleString('ru-RU')}\n\n${text}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voice_notes_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearText = () => {
    if (text.trim() && !window.confirm('Вы уверены, что хотите очистить весь текст?')) {
      return
    }
    setText('')
  }

  const displayedText = text + (transcript ? '\n' + transcript : '')

  return (
    <div className="voice-recorder-container">
      <div className="text-container">
        <h2 className="section-title">Голосовой блокнот</h2>
        <p className="section-subtitle">Говорите или вводите текст - все сохранится!</p>
        
        {!isSupported && (
          <div className="browser-warning">
            <p>⚠️ Ваш браузер не поддерживает распознавание речи. Пожалуйста, используйте Chrome или Edge.</p>
          </div>
        )}

        <div className="text-field-wrapper">
          <textarea
            ref={textareaRef}
            className="text-field"
            value={displayedText}
            onChange={handleTextChange}
            placeholder="Начните говорить или вводите текст здесь..."
            rows={12}
          />
          <div className="text-stats">
            <span>Символов: {text.length}</span>
            <span>Слов: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
            {transcript && <span className="recording-indicator">🎤 Распознавание...</span>}
          </div>
        </div>

        <div className="controls">
          <div className="recording-section">
            <button
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isSupported}
            >
              <span className="mic-icon">
                {isRecording ? (
                  <>
                    <div className="pulse-ring"></div>
                    <i className="fas fa-stop"></i>
                  </>
                ) : (
                  <i className="fas fa-microphone"></i>
                )}
              </span>
              {isRecording ? 'Остановить запись' : 'Начать запись'}
            </button>
            
            {isRecording && (
              <div className="recording-status">
                <span className="recording-dot"></span>
                <span className="recording-text">Идет запись... Говорите сейчас!</span>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <div className="export-buttons">
              <button className="export-btn docx-btn" onClick={exportToDocx} disabled={!text.trim()}>
                <i className="fas fa-file-word"></i>
                Экспорт в DOCX
              </button>

              <button className="export-btn txt-btn" onClick={exportToTxt} disabled={!text.trim()}>
                <i className="fas fa-file-alt"></i>
                Экспорт в TXT
              </button>

              <button 
                className="copy-btn" 
                onClick={() => {
                  navigator.clipboard.writeText(text)
                  alert('Текст скопирован в буфер обмена!')
                }}
                disabled={!text.trim()}
              >
                <i className="fas fa-copy"></i>
                Копировать
              </button>

              <button className="clear-btn" onClick={clearText} disabled={!text.trim() && !transcript}>
                <i className="fas fa-trash"></i>
                Очистить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceRecorder