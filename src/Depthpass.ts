import Config       from 'nanogl-state/config'
import Node       from 'nanogl-node'
import Camera       from 'nanogl-camera'

import ProgramCache from './ProgramCache'
import { GLContext } from 'nanogl/types';
import Input        from'./Input'
import Flag         from'./Flag'
import Enum         from'./Enum'
import ChunksList   from'./ChunkCollection'

import { mat4 } from 'gl-matrix';
import { GlslPrecision } from './interfaces/GlslPrecision';
import IMaterial from './interfaces/IMaterial';

import VertShader from './glsl/depthpass.vert';
import FragShader from './glsl/depthpass.frag';
import Program from 'nanogl/program'
import LightSetup from './LightSetup';
import { ICameraLens } from 'nanogl-camera/ICameraLens';
import DepthFormat, { DepthFormatEnum } from './DepthFormatEnum';

const M4           = mat4.create();



class DepthPass implements IMaterial {
  
  _vertSrc: string;
  _fragSrc: string;
  inputs: ChunksList;


  depthFormat: DepthFormatEnum;

  config: Config;
  _prgcache: ProgramCache;
  _uid: string;
  _precision: GlslPrecision;
  prg: Program | null;

  constructor( gl : GLContext ){
    
    this.prg = null;


    this.inputs          = new ChunksList();


    this.depthFormat = new Enum( 'depthFormat', DepthFormat );

    this.inputs.add( this.depthFormat );
    

    this.config    = new Config();

    this._prgcache = ProgramCache.getCache( gl );

    // for program-cache
    this._uid       = 'stddepth';
    this._precision = 'highp';
    this._vertSrc   = VertShader();
    this._fragSrc   = FragShader();


  }




  setLightSetup( setup : LightSetup ){
    this.depthFormat.proxy( setup?.depthFormat );
  }

  // render time !
  // ----------
  prepare( node :Node, camera : Camera<ICameraLens> ){

    if( this.prg === null ) return;
    
    if( this._isDirty() ){
      this.compile();
    }

    // this.

    var prg = this.prg;
    prg.use();

    prg.setupInputs( this );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP( M4 );


  }





  // need recompilation
  _isDirty(){
    return ( this.prg === null || this.inputs.isInvalid() );
  }


  compile(){
    if( this.prg !== null ){
      this._prgcache.release( this.prg );
    }
    this.prg = this._prgcache.compile( this );
  }



}

export default DepthPass