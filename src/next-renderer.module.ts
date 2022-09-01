import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { NextRendererService } from './next-renderer.service';
import {
  NextRendererAsyncOptions,
  NextRendererOptions,
  NextRendererOptionsFactory,
} from './next-renderer.interfaces';
import { NEXT_RENDERER_OPTIONS } from './next-renderer.constants';
import { NextRendererController } from './next-renderer.controller';

@Global()
@Module({})
export class NextRendererModule {
  /**
   * Method that helps us generate the options provider
   * @param options
   * @private
   */
  private static createOptionsProvider(options: NextRendererOptions): Provider {
    return {
      provide: NEXT_RENDERER_OPTIONS,
      useValue: options,
    };
  }

  /**
   * Method that helps us generate the asynchronous options provider
   * @param options
   * @private
   */
  private static createAsyncOptionsProvider(
    options: NextRendererAsyncOptions,
  ): Provider {
    // For `useFactory`
    if (options.useFactory) {
      return {
        provide: NEXT_RENDERER_OPTIONS,
        inject: options.inject || [],
        useFactory: options.useFactory,
      };
    }

    // For `useClass` and `useExisting`
    return {
      provide: NEXT_RENDERER_OPTIONS,
      inject: [options.useExisting || options.useClass],
      useFactory: async (optionsFactory: NextRendererOptionsFactory) =>
        await optionsFactory.createOptions(),
    };
  }

  /**
   * Method that helps us generate the module
   * @param options
   * @public
   */
  public static forRoot(options: NextRendererOptions): DynamicModule {
    return {
      module: NextRendererModule,
      providers: [this.createOptionsProvider(options), NextRendererService],
      controllers: [NextRendererController],
      exports: [NextRendererService],
    };
  }

  /**
   * Method that helps us generate the module asynchronously
   * @param options
   * @public
   */
  public static forRootAsync(options: NextRendererAsyncOptions): DynamicModule {
    return {
      module: NextRendererModule,

      imports: options.imports || [],
      providers: [
        this.createAsyncOptionsProvider(options),
        NextRendererService,
      ],
      controllers: [NextRendererController],
      exports: [NextRendererService],
    };
  }
}
