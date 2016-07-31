/**
 * Table contextualizer that resolve sections data according to contextualization+settings params
 * @module contextualizers/table
 */

import StaticTable from './StaticTable.js';
import {getMetaValue} from './../../core/utils/sectionUtils';

/**
 * Handle an inline contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeInlineStatic = (inputSection, inputContextualization, settings) => {
  const section = Object.assign({}, inputSection);
  const contextualization = Object.assign({}, inputContextualization);
  const citeKey = getMetaValue(section.metadata, 'general', 'citeKey');
  const data = section.data[contextualization.resources[0].citeKey];
  const node = contextualization.node;
  const blockIndex = node.blockIndex;
  let figureId;
  let number;
  const contents = node.child;
  // figure is not there yet, add it
  if (!contextualization.sectionOpCit) {
    section.figuresCount ++;
    figureId = citeKey + '-' + contextualization.citeKey;
    contextualization.figureId = figureId;
    contextualization.figureNumber = section.figuresCount;
    const figure = {
      node: 'element',
      special: true,
      tag: StaticTable,
      props: {
        resources: contextualization.resources,
        data,
        captionContent: [{
          node: 'text',
          text: contextualization.title || contextualization.resources[0].title
        }],
        figureNumber: contextualization.figureNumber,
        id: figureId
      }
    };
    number = contextualization.figureNumber;
    if (settings.figuresPosition === 'inline') {
      section.contents.splice(blockIndex + section.figuresCount, 0, figure);
    } else {
      section.figures = section.figures ? section.figures.concat(figure) : [figure];
    }
  } else {
    figureId = citeKey + '-' + contextualization.precursorCiteKey;
    section.contextualizations.some(cont =>{
      if (cont.citeKey === contextualization.precursorCiteKey) {
        number = cont.figureNumber;
        return true;
      }
    });
  }
  const displayId = '#peritext-figure-' + figureId;
  const newContents = [
    ...contents.slice(),
    {
      node: 'text',
      text: ' ('
    },
    {
      node: 'element',
      tag: 'a',
      attr: {
        href: displayId
      },
      child: [
        {
          node: 'text',
          text: 'figure ' + number
        }
      ]
    },
    {
      node: 'text',
      text: ') '
    }
  ];
  node.tag = 'span';
  node.child = newContents;
  section.contextualizations = section.contextualizations.map(cont=> {
    if (cont.citeKey === contextualization.citeKey) {
      return contextualization;
    }
    return cont;
  });
  return Object.assign({}, section);
};

/**
 * Handle a block contextualization for static outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeBlockStatic = (inputSection, inputContextualization, settings) => {
  return Object.assign({}, inputSection);
};

/**
 * Handle an inline contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeInlineDynamic = (inputSection, inputContextualization, settings) => {
  return Object.assign({}, inputSection);
};

/**
 * Handle a block contextualization for dynamic outputs
 * @param {Object} inputSection - The representation of the peritext section to update
 * @param {Object} inputContextualization - The representation of the contextualization to resolve
 * @param {Object} settings - the specific rendering settings to use for resolving the contextualization
 * @return {Object} newSection - the updated representation of the peritext section in which the contextualization was made
 */
export const contextualizeBlockDynamic = (inputSection, inputContextualization, settings) => {
  return Object.assign({}, inputSection);
};
