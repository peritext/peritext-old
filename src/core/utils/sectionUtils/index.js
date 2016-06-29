/**
 * section metadata & resources utils : access, filter, deletion, ...
 */

// section metadata access util
export function getMetaValue(metaList, domain, key) {
  const prop = metaList.find((meta) =>{
    return meta.domain === domain && meta.key === key;
  });
  if (prop) {
    return prop.value;
  }
  return undefined;
}

export function setMetaValue(metaList, domain, key, newValue) {
  const newMetaList = metaList.map((meta) =>{
    if (meta.domain === domain && meta.key === key) {
      meta.value = newValue;
    }
    return meta;
  });
  return newMetaList;
}

export function hasMeta(metaList, domain, key) {
  if (typeof domain === 'string') {
    return getMetaValue(metaList, domain, key) !== undefined;
  }else if (domain.domain) {
    return getMetaValue(metaList, domain.domain, domain.key) !== undefined;
  }
  throw new Error('error in couple ' + domain + '_' + key + ': hasMeta method needs either a domain+key pair or a metadata prop object');
}

export function findByMetadata(sections, domain, key, value) {
  return sections.find((section) =>{
    const meta = getMetaValue(section.metadata, domain, key);
    return meta === value;
  });
}

export function sameMetaScope(meta1, meta2) {
  return meta1.domain === meta2.domain && meta1.key === meta2.key;
}

export function deleteMeta(metaList, domain, key) {
  return metaList.filter((meta)=>{
    return !(domain === meta.domain && key === meta.key);
  });
}


export function metaStringToCouple(str) {
  const parts = str.split('_');
  const domain = (parts.length > 1) ? parts.shift() : 'general';
  const key = parts.join('_');
  return {domain, key};
}

export function hasResource(resourcesList, resource) {
  return resourcesList.find((res) =>{
    return resource.citeKey === res.citeKey;
  }) !== undefined;
}

export function filterResources(resourcesList, key, value) {
  return resourcesList.filter((res) =>{
    return res[key] === value;
  });
}

