import {expect} from 'chai';
import {waterfall} from 'async';
import {writeFile} from 'fs';

import {parseSection, serializeSection} from './../../../src/core/converters/sectionConverter';
import {createFromPath, updateFromPath, deleteFromPath, readFromPath} from './../../../src/core/connectors/filesystem';
import defaultParameters from './../../../src/config/defaultParameters'
import * as models from './../../../src/core/models/'

import {sample_folder_path, crud_cobaye_path} from "./../../test_settings.json";
const base_path = __dirname + '/../../' + sample_folder_path;

describe('sectionConverter:parser', function(){
  it('should parse', function(done){
    waterfall([
        function(callback){
          readFromPath({path:base_path, depth : true, parseFiles : true}, function(err, results){
            callback(err, results);
          });
        },
        function(tree, callback){
          parseSection({tree, models, parameters : defaultParameters}, callback);
        }
      ],
      function(err, tree){
        writeFile(base_path + '/parsing_output.json', JSON.stringify(tree, null, 2), 'utf8', function(err){
          console.log(err, ' done')
        });
        // console.log(tree,  err);
        done();
      });
  })
})