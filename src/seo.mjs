import {company,languages} from './content.mjs';
export const servicePages=['electrical.html','plumbing.html','hvac.html','coordination.html'];
export function structuredData({base,lang,page,title,description,t,faq,url,home}){
 const organization=company.domain+'/#organization',website=base+'/#website',pageId=url+'#webpage';
 const countries=[{ '@type':'Country',name:'Romania'},{'@type':'Country',name:'Germany'},{'@type':'Country',name:'Austria'}];
 const graph=[{
  '@type':['Organization','HomeAndConstructionBusiness'],'@id':organization,name:company.name,url:company.domain+'/',logo:{'@type':'ImageObject',url:company.domain+'/assets/logo.webp'},image:company.domain+'/assets/social.jpg',email:company.email,telephone:company.phoneUri,foundingDate:'2016',description:t.aboutIntro,
  address:{'@type':'PostalAddress',streetAddress:'Drumul Crețeștilor nr. 19',addressLocality:'București',addressRegion:'Sector 4',addressCountry:'RO'},
  hasMap:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Drumul Crețeștilor 19, București'),areaServed:countries,
  contactPoint:{'@type':'ContactPoint',telephone:company.phoneUri,email:company.email,contactType:'customer enquiries'},
  hasOfferCatalog:{'@type':'OfferCatalog',name:t.nav[0],itemListElement:t.services.map((s,i)=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s.title,description:s.intro,url:new URL(servicePages[i],url).href,provider:{'@id':organization}}}))}
 },{'@type':'WebSite','@id':website,url:base+'/',name:company.name,inLanguage:languages,publisher:{'@id':organization}},
 {'@type':'WebPage','@id':pageId,url,name:title+' | VASTASIA',description,inLanguage:lang,isPartOf:{'@id':website},about:{'@id':organization}}];
 if(page!=='index.html'){
  const items=[{name:t.home,url:home}];
  if(servicePages.includes(page))items.push({name:t.nav[0],url:new URL('services.html',url).href});items.push({name:title,url});
  graph.push({'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:items.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,item:x.url}))});graph[2].breadcrumb={'@id':url+'#breadcrumb'};
 }
 const index=servicePages.indexOf(page);
 if(index>=0){graph.push({'@type':'Service','@id':url+'#service',name:t.services[index].title,serviceType:t.services[index].title,description:t.services[index].intro,url,provider:{'@id':organization},areaServed:countries,mainEntityOfPage:{'@id':pageId}});graph[2].mainEntity={'@id':url+'#service'};}
 if(faq.length)graph.push({'@type':'FAQPage','@id':url+'#faq',inLanguage:lang,isPartOf:{'@id':pageId},mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
 return {'@context':'https://schema.org','@graph':graph};
}
