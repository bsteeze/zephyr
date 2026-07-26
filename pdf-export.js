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

  const PLANET_LABELS={sun:'Sun',moon:'Moon',mercury:'Mercury',venus:'Venus',mars:'Mars',jupiter:'Jupiter',saturn:'Saturn',uranus:'Uranus',neptune:'Neptune',pluto:'Pluto'};
  const ASPECT_LABELS={conjunction:'Conjunction',sextile:'Sextile',square:'Square',trine:'Trine',opposition:'Opposition'};
  const ASPECT_COLORS={conjunction:'#e8d27b',sextile:'#63d5a0',trine:'#63d5a0',square:'#f4678a',opposition:'#f4678a'};

  async function chartJpeg(chartData){
    const svg=document.querySelector('#natalChart');
    if(!svg)return null;
    const clone=svg.cloneNode(true);
    clone.setAttribute('width','1600');clone.setAttribute('height','1600');
    clone.querySelectorAll('.natal-aspect-line').forEach(line=>{
      const type=[...line.classList].find(name=>ASPECT_COLORS[name]);
      line.setAttribute('stroke',ASPECT_COLORS[type]||'#78a0dc');
      line.setAttribute('stroke-opacity','.88');
      line.setAttribute('stroke-width',type==='square'||type==='opposition'?'2.4':'2');
      line.style.opacity='1';
    });
    const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'});
    const url=URL.createObjectURL(blob);
    try{
      const image=await new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;
      });
      const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1600;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#071020';ctx.fillRect(0,0,1600,1600);ctx.drawImage(image,0,0,1600,1600);
      // The live wheel relies partly on page CSS. Redraw every calculated
      // aspect explicitly so PDF snapshots remain complete and legible.
      if(chartData?.angles?.ascendant&&Array.isArray(chartData.planets)&&Array.isArray(chartData.aspects)){
        const asc=Number(chartData.angles.ascendant.longitude)||0;
        const planets=new Map(chartData.planets.map(planet=>[planet.key,planet]));
        const point=longitude=>{
          const deg=(270-(Number(longitude)-asc)+3600)%360;
          const angle=(deg-90)*Math.PI/180;
          return [800+410*Math.cos(angle),800+410*Math.sin(angle)];
        };
        ctx.save();ctx.lineCap='round';
        chartData.aspects.forEach(aspect=>{
          const first=planets.get(aspect.planetA),second=planets.get(aspect.planetB);
          if(!first||!second)return;
          const a=point(first.longitude),b=point(second.longitude);
          ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);
          ctx.strokeStyle=ASPECT_COLORS[aspect.aspect]||'#78a0dc';
          ctx.globalAlpha=.88;
          ctx.lineWidth=Math.max(2.5,6.5-(Number(aspect.orb)||0)*.55);
          ctx.stroke();
        });
        ctx.restore();
      }
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

  function aspectSummary(chartData){
    const aspects=(chartData?.aspects||[]).slice().sort((a,b)=>(a.orb||99)-(b.orb||99));
    if(!aspects.length)return '';
    const strongest=aspects.slice(0,14).map(aspect=>{
      const first=PLANET_LABELS[aspect.planetA]||aspect.planetA;
      const second=PLANET_LABELS[aspect.planetB]||aspect.planetB;
      const type=ASPECT_LABELS[aspect.aspect]||aspect.aspect;
      return `${first} ${type} ${second} (${Number(aspect.orb||0).toFixed(1)} deg orb)`;
    });
    return `The chart contains ${aspects.length} major aspects. The closest connections, ordered by orb, are: ${strongest.join('; ')}. Green and gold lines show flowing or fused connections; rose lines show dynamic tension and polarity.`;
  }

  function buildTextPages(report,profile){
    const pages=[];
    pages.push({cover:true,title:report.title||`${profile.name}'s Natal Portrait`,subtitle:report.subtitle||'',meta:`${profile.dateLabel||profile.date||''} - ${profile.city||''}`});
    const content=[
      {eyebrow:'CHART SYNTHESIS',title:'Your chart as a whole',body:report.synthesis},
      ...(report.sections||[]),
      {eyebrow:'ASPECTS AT A GLANCE',title:'The chart’s strongest conversations',body:aspectSummary(profile.chart)},
      {eyebrow:'INTEGRATION',title:'Closing observation',body:report.closing},
      {eyebrow:'A NOTE ON INTERPRETATION',title:'Reflective, not deterministic',body:report.disclaimer}
    ].filter(section=>section.body);
    let page={lines:[]},remaining=40;
    const pushPage=()=>{if(page.lines.length)pages.push(page);page={lines:[]};remaining=40;};
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
      // Zephyr sun mark and masthead.
      commands.push('0.91 0.72 0.33 RG 1.8 w 97 712 m 97 719.18 91.18 725 84 725 c 76.82 725 71 719.18 71 712 c 71 704.82 76.82 699 84 699 c 91.18 699 97 704.82 97 712 c S');
      commands.push('0.91 0.72 0.33 RG 1.2 w 88 712 m 88 714.21 86.21 716 84 716 c 81.79 716 80 714.21 80 712 c 80 709.79 81.79 708 84 708 c 86.21 708 88 709.79 88 712 c S');
      commands.push('0.91 0.72 0.33 RG 1.4 w 84 732 m 84 741 l S 84 683 m 84 692 l S 55 712 m 64 712 l S 104 712 m 113 712 l S');
      commands.push('0.91 0.72 0.33 RG 1.4 w 64 732 m 70 726 l S 98 698 m 104 692 l S 104 732 m 98 726 l S 70 698 m 64 692 l S');
      commands.push('0.97 0.98 0.99 rg BT /F1 18 Tf 126 716 Td (ZEPHYR) Tj ET');
      commands.push('0.62 0.68 0.79 rg BT /F1 7 Tf 126 700 Td (CELESTIAL HARMONY) Tj ET');
      commands.push('0.91 0.72 0.33 rg BT /F1 10 Tf 72 656 Td (NATAL PORTRAIT) Tj ET');
      commands.push(`0.97 0.98 0.99 rg BT /F1 30 Tf 72 600 Td (${pdfEscape(page.title)}) Tj ET`);
      wrap(page.subtitle,52).slice(0,5).forEach((line,i)=>commands.push(`0.72 0.77 0.87 rg BT /F1 15 Tf 72 ${535-i*24} Td (${pdfEscape(line)}) Tj ET`));
      commands.push(`0.42 0.84 0.68 rg BT /F1 11 Tf 72 130 Td (${pdfEscape(page.meta)}) Tj ET`);
    }else if(page.chart){
      commands.push('0.91 0.72 0.33 rg BT /F1 9 Tf 56 754 Td (ZEPHYR  /  CELESTIAL MAP) Tj ET');
      commands.push(`0.97 0.98 0.99 rg BT /F1 17 Tf 56 727 Td (${pdfEscape(page.title)}) Tj ET`);
      commands.push('q 500 0 0 500 56 172 cm /Chart Do Q');
      commands.push('0.65 0.70 0.80 rg BT /F1 9 Tf 56 141 Td (Full calculated natal chart with major aspect geometry) Tj ET');
      commands.push('0.42 0.84 0.68 rg BT /F1 8 Tf 56 122 Td (GREEN / GOLD: FLOW AND FUSION) Tj ET');
      commands.push('0.96 0.40 0.55 rg BT /F1 8 Tf 285 122 Td (ROSE: TENSION AND POLARITY) Tj ET');
    }else{
      commands.push('0.91 0.72 0.33 rg BT /F1 8 Tf 56 758 Td (ZEPHYR  /  NATAL PORTRAIT) Tj ET');
      commands.push('0.16 0.21 0.31 RG .6 w 56 744 m 556 744 l S');
      let y=718;
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
    if(!page.cover)commands.push('0.38 0.45 0.58 rg BT /F1 7 Tf 56 30 Td (ZEPHYR.GURU) Tj ET');
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
    const image=await chartJpeg(profile?.chart);
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
