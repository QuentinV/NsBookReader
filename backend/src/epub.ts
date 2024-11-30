import { EPub } from 'epub2';
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

const epubFilePath = path.resolve(__dirname, '.epub/LesMagiciens.T1.epub');

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

    return (await Promise.all(promises)).filter( (b: string) => !!b ).join('\r\n\r\n\r\n//=====//\r\n\r\n\r\n')
}

if ( !fs.existsSync(epubFilePath) ) {
    console.log('ERROR file not found');
} else {
    (async () => {
        const result = await readEpub(epubFilePath)
        fs.writeFileSync(path.resolve(__dirname,'.epub/result.txt'), result);
    })();
}