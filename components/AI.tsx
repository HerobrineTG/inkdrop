import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $insertNodes } from 'lexical'
import { $createParagraphNode, $createTextNode } from 'lexical'
import { Button } from './ui/button'

interface AIProps {
  roomId: string
  className?: string
  isLoading?: boolean
}

const AI = ({ roomId, className, isLoading = false }: AIProps) => {
  const [editor] = useLexicalComposerContext()
  const [prompt, setPrompt] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insertTextIntoEditor = (text: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        // Split text by paragraphs and create nodes
        const paragraphs = text.split('\n\n')
        const nodes = paragraphs.map(paragraph => {
          const paragraphNode = $createParagraphNode()
          paragraphNode.append($createTextNode(paragraph))
          return paragraphNode
        })
        $insertNodes(nodes)
      }
    })
  }

  const handleGenerateSuggestion = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          roomId // Include roomId for potential context
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Handle different response formats
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions)
      } else if (data.response) {
        setSuggestions([data.response])
      } else if (typeof data === 'string') {
        setSuggestions([data])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (error) {
      console.error('Error generating AI suggestion:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate AI response')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseSuggestion = (suggestion: string) => {
    insertTextIntoEditor(suggestion)
    setPrompt('')
    setSuggestions([])
    setError(null)
  }

  const handleQuickAction = async (action: string) => {
    setPrompt(action)
    // Auto-generate for quick actions
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: action,
          roomId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions)
      } else if (data.response) {
        setSuggestions([data.response])
      } else if (typeof data === 'string') {
        setSuggestions([data])
      }
      
    } catch (error) {
      console.error('Error generating AI suggestion:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate AI response')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={cn(
      "bg-transparent rounded-lg p-4 space-y-4",
      "shadow-lg backdrop-blur-sm",
      className
    )}>
      <div className="bg-gradient-to-b from-purple-800 to-transparent rounded-md shadow-lg p-4 mb-4 -mx-4 -mt-4 rounded-b-none">
        <h2 className="text-4xl font-semibold text-white text-center tracking-wide font-poppins">
          AI
        </h2>
      </div>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 10V3L4 14h7v7l9-11h-7z" 
            />
          </svg>
        </div>
        <h3 className="text-white font-poppins font-medium">Inkdrop AI</h3>
        {(isLoading || isGenerating) && (
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to help with your document..."
          className={cn(
            "w-full bg-dark-300 border border-dark-400 rounded-md p-3",
            "text-white placeholder-gray-400 font-poppins text-sm",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            "resize-none min-h-[80px]"
          )}
          disabled={isGenerating}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              handleGenerateSuggestion()
            }
          }}
        />
        
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateSuggestion}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "gradient-blue h-full gap-1 px-5"
            )}
            variant="purpleBorder"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Generate
              </>
            )}
          </Button>
          
          {prompt && (
            <Button
              onClick={() => {
                setPrompt('')
                setSuggestions([])
                setError(null)
              }}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <p className="text-red-400 text-sm font-poppins">{error}</p>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-poppins font-medium text-sm">AI Suggestions:</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  "bg-dark-300 border border-dark-400 rounded-md p-3",
                  "hover:border-purple-500 transition-colors cursor-pointer group"
                )}
                onClick={() => handleUseSuggestion(suggestion)}
              >
                <p className="text-gray-300 text-sm font-poppins leading-relaxed whitespace-pre-wrap">
                  {suggestion}
                </p>
                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-purple-400 group-hover:text-purple-300 transition-colors">
                    Click to insert →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-dark-400 pt-3">
        <p className="text-gray-400 text-xs font-poppins mb-2">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Summarize this document',
            'Improve the writing style',
            'Generate an outline',
            'Fix grammar and spelling',
            'Make it more professional',
            'Simplify the language'
          ].map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={isGenerating}
              className={cn(
                "px-3 py-1 bg-dark-350 text-gray-300 rounded-full text-xs font-poppins",
                "hover:bg-dark-400 hover:text-white transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AI