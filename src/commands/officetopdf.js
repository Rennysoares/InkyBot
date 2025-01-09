import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';
import ILovePDFFile from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile.js';
import fs from 'fs';

const instance = new ILovePDFApi('project_public_2db233715b8184510c46e60317d2cf09_9hLC99c2aad372325d16c766268f92476345c', 'secret_key_4c9951b1807664546c79870df522ffa1_VEPYt98915fe8ed506ed6b3fb841a32acd782');
const task = instance.newTask('officepdf');
const file = new ILovePDFFile('./freud.docx');

export async function officetopdf(){
    await task.start();
    await task.addFile(file);
    await task.process();
    
    const data = await task.download();
    fs.writeFileSync('./wordtopdf.pdf', data)
    
}
