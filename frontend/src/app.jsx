import * as React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { useState, useRef, useEffect } from 'react';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeflex/primeflex.css";
import { Button } from 'primereact/button';
import { books } from './constants';

export const App = () => {
    const ref = useRef(null);
    const [audioId, setAudioId] = useState();

    const saveTime = () => {
        const time = ref.current.currentTime;
        if ( time )
            localStorage.setItem(books[ref.current.bookIndex], time);
    }

    const changeAudio = async (i) => {
        const bookUrl = books[i];

        const response = await fetch(bookUrl);
        const blob = await response.blob(); 
        const blobUrl = URL.createObjectURL(blob); 

        ref.current.src = blobUrl;
        ref.current.addEventListener('loadedmetadata', () => {
            const bookUrl = books[i];
            const time = localStorage.getItem(bookUrl);
            ref.current.currentTime = parseFloat(time);
        })
        ref.current.bookIndex = i; 
        
        setAudioId(i);
    }

    useEffect(() => {
        if ( !ref?.current ) return;
        ref.current.addEventListener('timeupdate', saveTime);
        
        return () => {
            ref.current.removeEventListener('timeupdate', saveTime);
        }
    }, [ref])

    return (
        <PrimeReactProvider>
            <div>
                <div className="w-full flex">
                    <audio className="flex-1" ref={ref} controls onTimeUpdate={saveTime} preload="auto" autobuffer="true">
                        <source src='' type="audio/mp3"></source>
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <div className="overflow-auto flex-wrap flex">
                    {books.map( (v, i) => (
                        <div className="m-2" key={i}><Button severity={audioId === i ? 'primary' : 'secondary'} onClick={() => changeAudio(i)}>Chapter {i}</Button></div>
                    ))}
                </div>
            </div>
        </PrimeReactProvider>
    );
}