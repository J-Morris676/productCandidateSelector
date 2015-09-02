/// <reference path="../types.ts" />

module app.services.stepBuilderServices{
    export class stepBuilderService {

        private steps: string = "";

        public addStep(indentation: number, step: string, trailingNewLines: number): stepBuilderService {
            this.addIndents(indentation);

            this.steps = this.steps.concat(step);

            this.addNewLines(trailingNewLines);
            return this;
        }


        public getSteps(): string {
            return this.steps;
        }

        public resetSteps() {
            this.steps = "";
        }

        private addIndents(indentation: number): void {
            for (var indentIdx = 0; indentIdx < indentation; indentIdx++) {
                this.steps += "\t";
            }
        }

        private addNewLines(newLines: number):void {
            for (var newLineIdx = 0; newLineIdx < newLines; newLineIdx++) {
                this.steps += "\n";
            }
        }
    }
}