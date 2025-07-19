'use client';

import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import React from 'react';

import { FloatingComposer, FloatingThreads, liveblocksConfig, LiveblocksPlugin, useEditorStatus } from '@liveblocks/react-lexical'
import Loader from '../Loader';

import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin'
import { useThreads } from '@liveblocks/react/suspense';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { DeleteModal } from '../DeleteModal';
import Chat from '../Chat';
import Tasks from '../Tasks';
import Calendar from '../Calendar';
import AI from '../AI';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

export function Editor({ roomId, currentUserType }: { roomId: string, currentUserType: UserType }) {
  const status = useEditorStatus();
  const { threads } = useThreads();

  const initialConfig = liveblocksConfig({
    namespace: 'Editor',
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === 'editor',
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full font-poppins">
        <div className="toolbar-wrapper flex min-w-full justify-between">
          <ToolbarPlugin />
          {currentUserType === 'editor' && <DeleteModal roomId={roomId} />}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {status === 'not-loaded' || status === 'loading' ? <Loader /> : (
            <div className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full" />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === 'editor' && <FloatingToolbarPlugin />}
              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          )}

          <LiveblocksPlugin>
            <FloatingComposer className="w-[350px]" />
            <FloatingThreads threads={threads} />
            <div className="w-full max-w-[350px] mt-6">
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="flex w-full justify-between bg-muted rounded-lg p-1">
                  <TabsTrigger value="chat" className="w-1/2">Chat</TabsTrigger>
                  <TabsTrigger value="tasks" className="w-1/2">Tasks</TabsTrigger>
                  <TabsTrigger value="calendar" className="w-1/2">Calendar</TabsTrigger>
                  <TabsTrigger value="ai" className="w-1/2">AI</TabsTrigger>
                </TabsList>
                <TabsContent value="chat">
                  <Chat roomId={roomId} user={currentUserType} />
                </TabsContent>
                <TabsContent value="tasks">
                  <Tasks roomId={roomId} />
                </TabsContent>
                <TabsContent value='calendar'>
                  <Calendar roomId={roomId}/>
                </TabsContent>
                <TabsContent value="ai">
                  <AI roomId={roomId}></AI>
                </TabsContent>
              </Tabs>
            </div>
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
