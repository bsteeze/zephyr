(() => {
  'use strict';

  const enc=new TextEncoder();
  const ascii=value=>String(value??'')
    .normalize('NFKD').replace(/[^\x20-\x7E\n]/g,c=>({'’':"'",'“':'"','”':'"','—':'-','–':'-','…':'...','°':' deg '}[c]||''))
    .replace(/\s+/g,' ').trim();
  const pdfEscape=value=>ascii(value).replace(/([\\()])/g,'\\$1');
  const concat=chunks=>{
    const size=chunks.reduce((n,c)=>n+c.length,0),out=new Uint8Array(size);let offset=0;
    chunks.forEach(c=>{out.set(c,offset);offset+=c.length;});return out;
  };
  const wrap=(text,max=82)=>{
    const words=ascii(text).split(/\s+/),lines=[];let line='';
    words.forEach(word=>{
      const next=line?`${line} ${word}`:word;
      if(next.length>max&&line){lines.push(line);line=word;}else line=next;
    });
    if(line)lines.push(line);return lines;
  };

  async function chartJpeg(){
    const svg=document.querySelector('#natalChart');
    if(!svg)return null;
    const clone=svg.cloneNode(true);
    clone.setAttribute('width','1600');clone.setAttribute('height','1600');
    const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'});
    const url=URL.createObjectURL(blob);
    try{
      const image=await new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;
      });
      const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1600;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#071020';ctx.fillRect(0,0,1600,1600);ctx.drawImage(image,0,0,1600,1600);
      ctx.beginPath();ctx.arc(800,800,155,0,Math.PI*2);ctx.fillStyle='#091329';ctx.fill();
      ctx.strokeStyle='#d8ad58';ctx.lineWidth=4;ctx.stroke();
      ctx.textAlign='center';ctx.fillStyle='#f7f8fd';ctx.font='700 58px Arial';
      ctx.fillText(ascii(document.querySelector('#natalCenterName')?.textContent||'Natal'),800,795);
      ctx.fillStyle='#aab2c7';ctx.font='34px Arial';
      ctx.fillText(ascii(document.querySelector('#natalCenterMeta')?.textContent||''),800,850);
      const data=canvas.toDataURL('image/jpeg',.94).split(',')[1];
      const binary=atob(data),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      return {bytes,width:1600,height:1600};
    }finally{URL.revokeObjectURL(url);}
  }

  function buildTextPages(report,profile){
    const pages=[];
    pages.push({cover:true,title:report.title||`${profile.name}'s Natal Portrait`,subtitle:report.subtitle||'',meta:`${profile.dateLabel||profile.date||''} - ${profile.city||''}`});
    const content=[
      {eyebrow:'CHART SYNTHESIS',title:'Your chart as a whole',body:report.synthesis},
      ...(report.sections||[]),
      {eyebrow:'INTEGRATION',title:'Closing observation',body:report.closing},
      {eyebrow:'A NOTE ON INTERPRETATION',title:'Reflective, not deterministic',body:report.disclaimer}
    ];
    let page={lines:[]},remaining=43;
    const pushPage=()=>{if(page.lines.length)pages.push(page);page={lines:[]};remaining=43;};
    content.forEach(section=>{
      const body=wrap(section.body,84);
      const needed=body.length+4;
      if(needed>remaining&&page.lines.length)pushPage();
      page.lines.push({kind:'eyebrow',text:section.eyebrow||section.category||'OBSERVATION'});
      page.lines.push({kind:'title',text:section.title||'Observation'});
      body.forEach(line=>{
        if(remaining<=2)pushPage();
        page.lines.push({kind:'body',text:line});remaining--;
      });
      page.lines.push({kind:'space',text:''});remaining-=4;
    });
    pushPage();
    pages.push({chart:true,title:`${profile.name||'Natal'} - Celestial Map`});
    return pages;
  }

  function contentForPage(page,pageNumber,totalPages){
    const commands=['0.027 0.063 0.125 rg 0 0 612 792 re f'];
    if(page.cover){
      commands.push('0.91 0.72 0.33 rg BT /F1 12 Tf 72 690 Td (ZEPHYR NATAL PORTRAIT) Tj ET');
      commands.push(`0.97 0.98 0.99 rg BT /F1 30 Tf 72 600 Td (${pdfEscape(page.title)}) Tj ET`);
      wrap(page.subtitle,52).slice(0,5).forEach((line,i)=>commands.push(`0.72 0.77 0.87 rg BT /F1 15 Tf 72 ${535-i*24} Td (${pdfEscape(line)}) Tj ET`));
      commands.push(`0.42 0.84 0.68 rg BT /F1 11 Tf 72 130 Td (${pdfEscape(page.meta)}) Tj ET`);
    }else if(page.chart){
      commands.push(`0.91 0.72 0.33 rg BT /F1 12 Tf 56 742 Td (${pdfEscape(page.title)}) Tj ET`);
      commands.push('q 500 0 0 500 56 160 cm /Chart Do Q');
      commands.push('0.65 0.70 0.80 rg BT /F1 9 Tf 56 125 Td (Full calculated natal chart) Tj ET');
    }else{
      let y=735;
      (page.lines||[]).forEach(line=>{
        if(line.kind==='space'){y-=10;return;}
        const style=line.kind==='eyebrow'
          ?['0.42 0.84 0.68 rg',9,14]
          :line.kind==='title'
            ?['0.97 0.98 0.99 rg',18,27]
            :['0.74 0.78 0.87 rg',11,16];
        commands.push(`${style[0]} BT /F1 ${style[1]} Tf 56 ${y} Td (${pdfEscape(line.text)}) Tj ET`);
        y-=style[2];
      });
    }
    commands.push(`0.38 0.45 0.58 rg BT /F1 8 Tf 540 30 Td (${pageNumber}/${totalPages}) Tj ET`);
    return enc.encode(commands.join('\n'));
  }

  function assemblePdf(pages,image){
    const pageCount=pages.length,pageObjStart=5;
    const objects=[];
    objects[1]=enc.encode('<< /Type /Catalog /Pages 2 0 R >>');
    const kids=pages.map((_,i)=>`${pageObjStart+i*2} 0 R`).join(' ');
    objects[2]=enc.encode(`<< /Type /Pages /Count ${pageCount} /Kids [${kids}] >>`);
    objects[3]=enc.encode('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    objects[4]=image
      ?concat([enc.encode(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`),image.bytes,enc.encode('\nendstream')])
      :enc.encode('<< >>');
    pages.forEach((page,i)=>{
      const pageObj=pageObjStart+i*2,contentObj=pageObj+1,content=contentForPage(page,i+1,pageCount);
      const resources=page.chart?'<< /Font << /F1 3 0 R >> /XObject << /Chart 4 0 R >> >>':'<< /Font << /F1 3 0 R >> >>';
      objects[pageObj]=enc.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources ${resources} /Contents ${contentObj} 0 R >>`);
      objects[contentObj]=concat([enc.encode(`<< /Length ${content.length} >>\nstream\n`),content,enc.encode('\nendstream')]);
    });
    const chunks=[enc.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offsets=[0];
    let length=chunks[0].length;
    for(let i=1;i<objects.length;i++){
      offsets[i]=length;
      const chunk=concat([enc.encode(`${i} 0 obj\n`),objects[i],enc.encode('\nendobj\n')]);
      chunks.push(chunk);length+=chunk.length;
    }
    const xrefOffset=length;
    let xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for(let i=1;i<objects.length;i++)xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;
    xref+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(enc.encode(xref));return concat(chunks);
  }

  async function download(report,profile){
    if(!report)throw new Error('Generate the expert interpretation first.');
    const image=await chartJpeg();
    const pages=buildTextPages(report,profile||{});
    const bytes=assemblePdf(pages,image);
    const blob=new Blob([bytes],{type:'application/pdf'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    const name=ascii(profile?.name||'Zephyr').replace(/[^A-Za-z0-9_-]+/g,'_');
    a.href=url;a.download=`${name}_Zephyr_Natal_Portrait.pdf`;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  window.ZephyrPdf={download};
})();
