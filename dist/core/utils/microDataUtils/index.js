'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Collection of utils for formatting scholarly citations in html/schema/microformat/RDFa/COiNS
 * Schema reference could be even more covered
 */

// I give the schema type of an object based on its bibType
var bibToSchema = exports.bibToSchema = function bibToSchema(bib) {
  switch (bib) {
    case 'book':
      return 'Book';
    case 'article':
      return 'ScholarlyArticle';
    case 'booklet':
      return 'CreativeWork';
    case 'conference':
      return 'Chapter';
    case 'incollection':
      return 'Chapter';
    case 'inherits':
      return 'Chapter';
    case 'inbook':
      return 'Chapter';
    case 'mastersthesis':
      return 'Thesis';
    case 'phdthesis':
      return 'Thesis';
    case 'proceedings':
      return 'Book';
    case 'image':
      return 'ImageObject';
    case 'online':
      return 'WebSite';
    case 'vectorsImage':
      return 'ImageObject';
    case 'tabularData':
      return 'Dataset';
    case 'video':
      return 'VideoObject';
    case 'audio':
      return 'AudioObject';
    case 'person':
      return 'Person';
    case 'place':
      return 'Place';
    case 'organization':
      return 'Organization';
    // not very accurate
    case 'artefact':
      return 'Product';
    // no schematype for these ones (too abstract)
    case 'topic':
    case 'concept':
    case 'technology':
      return 'Thing';
    default:
      return 'CreativeWork';
  }
};

/**
  COiNS related
*/

var addProp = function addProp(key, value) {
  return {
    key: key,
    value: value
  };
};

var urify = function urify(key, value) {
  return key + '=' + encodeURIComponent(value);
};

var assembleUri = function assembleUri(infos) {
  var vals = [];
  infos.forEach(function (info) {
    vals.push(urify(info.key, info.value));
  });
  return vals.join('&amp;');
};

var baseMap = {
  'rft.date': 'date',
  'rft.pages': 'pages',
  'rft.issn': 'ISSN',
  'rft.isbn': 'ISBN',
  'rft_id': 'url',
  'rft.place': 'address',
  'rft.pub': 'publisher'
};

var journalMap = {
  'rft.atitle': 'title',
  'rft.jtitle': 'journal',
  'rft.volume': 'volume',
  'rft.issue': 'issue'
};

var chapterMap = {
  'rft.atitle': 'title',
  'rft.btitle': 'booktitle'
};

var translate = function translate(data, item, map) {
  for (var key in map) {
    if (item[map[key]]) {
      data.push(addProp(key, item[map[key]]));
    }
  }
  return data;
};

var generateOpenUrl = exports.generateOpenUrl = function generateOpenUrl(resource) {
  var data = [];
  data.push(addProp('ctx_ver', 'Z39.88-2004'));

  if (resource.author && resource.author.length) {
    resource.author.forEach(function (author) {
      data.push(addProp('rft.au', author.lastName + ', ' + author.firstName));
    });
  }
  data = translate(data, resource, baseMap);
  if (resource.bibType === 'journal' || resource.bibType === 'article') {
    data = translate(data, resource, journalMap);
    data.push(addProp('rft.genre', 'article'));
    data.push(addProp('rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal'));
  } else if (resource.bibType === 'proceedings' || resource.bibType === 'conferencePaper') {
    data = translate(data, resource, journalMap);
    data.push(addProp('rft.genre', 'conference'));
    data.push(addProp('rft_val_fmt', 'info:ofi/fmt:kev:mtx:book'));
  } else if (resource.bibType === 'chapter') {
    data = translate(data, resource, chapterMap);
    data.push(addProp('rft.genre', 'bookitem'));
    data.push(addProp('rft_val_fmt', 'info:ofi/fmt:kev:mtx:book'));
  } else {
    data.push(addProp('rft.genre', 'document'));
  }
  return assembleUri(data);
};