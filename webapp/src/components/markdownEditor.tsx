// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {Suspense, useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {Utils} from '../utils'

const MarkdownEditorInput = React.lazy(() => import('./markdownEditorInput/markdownEditorInput'))

type Props = {
    id?: string
    text?: string
    placeholderText?: string
    className?: string
    readonly?: boolean

    onChange?: (text: string) => void
    onFocus?: () => void
    onBlur?: (text: string) => void
}

const MarkdownEditor = (props: Props): JSX.Element => {
    const {placeholderText, onFocus, onBlur, onChange, text, id} = props
    const [isEditing, setIsEditing] = useState(false)
    const html: string = Utils.htmlFromMarkdown(text || placeholderText || '')

    // HACKHACK: Use React Router to navigate
    const routerHistory = useHistory()

    const previewElement = (
        <div
            data-testid='preview-element'
            className={text ? 'octo-editor-preview' : 'octo-editor-preview octo-placeholder'}
            dangerouslySetInnerHTML={{__html: html}}
            onClick={(e) => {
                const LINK_TAG_NAME = 'a'
                const element = e.target as Element
                if (element.tagName.toLowerCase() === LINK_TAG_NAME) {
                    e.stopPropagation()
                    return
                }

                if (!props.readonly && !isEditing) {
                    setIsEditing(true)
                }
            }}
        />
    )

    const editorOnBlur = (newText: string) => {
        setIsEditing(false)
        onBlur && onBlur(newText)
    }

    const editorElement = (
        <Suspense fallback={<></>}>
            <MarkdownEditorInput
                id={id}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={editorOnBlur}
                initialText={text}
                isEditing={isEditing}
            />
        </Suspense>
    )

    // HACKHACK: This is to prevent the crazy-slow loading of a full page navigation
    useEffect(() => {
        const localLinks = document.getElementsByClassName('localLink')
        for (const linkElement of localLinks) {
            const link = linkElement as HTMLAnchorElement
            link.addEventListener('click', (event) => {
                let url = encodeURI((event.target as HTMLElement)?.getAttribute('localhref') || '')
                // Add current query string params to link, e.g read-only token
                const currentUrl = new URL(window.location.href)
                if (currentUrl.search) {
                    url += currentUrl.search
                }
                routerHistory.push(url)
                event.preventDefault()
                return false
            })
        }
    })

    const element = (
        <div className={`MarkdownEditor octo-editor ${props.className || ''} ${isEditing ? 'active' : ''}`}>
            {!isEditing && previewElement}
            {editorElement}
        </div>
    )

    return element
}

export {MarkdownEditor}
