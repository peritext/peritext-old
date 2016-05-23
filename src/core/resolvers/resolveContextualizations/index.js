import {getMetaValue} from './../../utils/sectionUtils';
import {getResourceModel, getContextualizerModel, resolvePropAgainstType} from './../../utils/modelUtils';


function resolveContextualizer(contextualizer, section, models) {
  const err = [];
  let newContextualizer = Object.assign({}, contextualizer);
  // if overloading, first fetch the existing contextualizer
  if (newContextualizer.overloading) {
    const overload = newContextualizer.overloading.replace(/^@/, '');
    // find original
    const original = section.contextualizers.find((cont) =>{
      return cont.citeKey === overload;
    });
    // resolve original
    if (original) {
      const originalFormatted = resolveContextualizer(original, section, models).finalContextualizer;
      newContextualizer = Object.assign(originalFormatted, newContextualizer);
    } else {
      // no original found ==> overloading reference error
      err.push({
        type: 'error',
        preciseType: 'invalidContextualizer',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'overloading reference error: contextualizer ' + newContextualizer.citeKey + ' should overload ' + overload + ' but the original contextualizer does not exist'
      });
    }
  }
  // guess contextualizer type if needed
  if (!newContextualizer.type) {
    // one resource
    if (newContextualizer.resources.length === 1) {
      const sourceKey = newContextualizer.resources[0];
      const source = section.resources.find((resource)=>{
        return resource.citeKey === sourceKey;
      });
      const sourceModel = getResourceModel(source.bibType, models.resourceModels);
      newContextualizer.type = sourceModel.defaultContextualizer;
    }
  }
  // resolve contextualizer object against its model
  const contextualizerModel = getContextualizerModel(newContextualizer.type, models.contextualizerModels);
  const finalContextualizer = contextualizerModel.properties.reduce((obj, thatModel) =>{
    obj[thatModel.key] = resolvePropAgainstType(newContextualizer[thatModel.key], thatModel.valueType, thatModel);
    // record error if required field is undefined
    if (obj[thatModel.key] === undefined && thatModel.required === true) {
      err.push({
        type: 'error',
        preciseType: 'invalidContextualizer',
        sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
        message: 'contextualizer ' + newContextualizer.citeKey + ' (' + newContextualizer.type + ') does not provide required type ' + thatModel.key
      });
    }
    return obj;
  }, {});
  return {err, finalContextualizer};
}

export function resolveContextualizersAndContextualizations({section, models}, cb) {
  let errors = [];

  // populate contextualizers against their models
  section.contextualizers = section.contextualizers.map((contextualizer)=>{
    const {err, finalContextualizer} = resolveContextualizer(contextualizer, section, models);
    if (err.length) {
      errors = errors.concat(err);
    }
    return finalContextualizer;
  });


  // verify that all required resources exist
  section.contextualizations = section.contextualizations.filter((contextualization) =>{
    let ok = true;
    // prepare resourceType<->contextualizerType compatibility check
    const contextualizer = section.contextualizers.find((cont) =>{
      return cont.citeKey === contextualization.contextualizer;
    });
    const acceptedResourceTypes = getContextualizerModel(contextualizer.type, models.contextualizerModels).acceptedResourceTypes;
    // resources compatibility and existence check
    contextualization.resources.some((resId) =>{
      // find related resource
      const res = section.resources.find((resource) =>{
        return resource.citeKey === resId;
      });
      // resource exists, check if it is accepted for the contextualizerType
      if (res !== undefined) {
        let accepted = false;
        acceptedResourceTypes.some((type) => {
          if (type === '*' || type === res.bibType) {
            accepted = true;
            return true;
          }
        });
        if (!accepted) {
          ok = false;
          errors.push({
            type: 'error',
            preciseType: 'invalidContextualization',
            sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
            message: 'resource ' + res + ' was asked in a contextualization but is not handled by the contextualizer ' + contextualization.contextualizer
          });
        }
      } else {
        ok = false;
        errors.push({
          type: 'error',
          preciseType: 'invalidContextualization',
          sectionCiteKey: getMetaValue(section.metadata, 'general', 'citeKey'),
          message: 'resource ' + res + ' was asked in a contextualization but was not found'
        });
      }
      return ok;
    });
    return ok;
  });
  cb(null, {errors, section});
}
