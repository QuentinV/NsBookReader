import { EPub } from 'epub2';
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import { Agent, fetch, Client } from "undici";

const epubFilePath = path.resolve(__dirname, '.epub/input.epub');

const readEpub = async ( epubPath: string ): Promise<string> => {        
    // Create an EPub instance
    const epub = await EPub.createAsync(epubPath, '', '');
    const { language, publisher, description, title, creator, date, subject } = epub.metadata;
    const metadata = {
        language, publisher, description, title, creator, date, subject
    };
    console.log(metadata)

    const promises = epub.flow.map((chapter: any) => new Promise( async (res, rej) => {
        const page = await epub.getChapterAsync(chapter.id);
        try {
            const html = parse(page);
            html.querySelectorAll('a').forEach( a => a.remove() );
            html.querySelectorAll('h2').forEach( h => h.replaceWith(`<p>Chapitre: ${h.innerHTML}</p>`));
            html.querySelectorAll('div').forEach( d => d.remove() );
            html.querySelectorAll('>*')?.filter((node: any) => node.rawTagName !== 'p')?.forEach( a => a.remove() );
            const text = html.text.trim();
            res(text);
        } catch ( e ) {
            console.error(e);
            throw e;
        }        
    }));

    return (await Promise.all(promises)).filter( (b: string) => !!b );
}

if ( !fs.existsSync(epubFilePath) ) {
    console.log('ERROR file not found');
} else {
    (async () => {
        const result = await readEpub(epubFilePath)
        for ( let i = 0; i < result.length; ++i ) {
            const start = Date.now();
            console.log('running tts for ', i)
            const text = result[i];
            const res = await fetch(process.env.TTS_ENDPOINT, {
                method: 'POST', 
                body: JSON.stringify({
                    "text": text,
                    "model": "tts_models/multilingual/multi-dataset/xtts_v2",
                    "language": "fr",
                    "speaker": "Asya Anara"
                }),
                headers: {
                    "Content-Type": "application/json"
                },
                dispatcher: new Agent({
                    connectTimeout: 24 * 60 * 60 * 1000, 
                    headersTimeout: 24 * 60 * 60 * 1000, 
                    bodyTimeout: 24 * 60 * 60 * 1000,   
                })
            });
            const blob = await res.blob();
            fs.writeFileSync(path.resolve(__dirname, `.epub/.result/${i}.mp3`), Buffer.from(await blob.arrayBuffer()));
            console.log('mp3 file saved for ', i, Date.now() - start)
        }
    })();
}