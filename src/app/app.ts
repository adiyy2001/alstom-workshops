import {Component, signal, ViewChild, ElementRef, AfterViewInit, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

interface NodeData extends go.ObjectData {
  key: number;
  name: string;
  status?: 'active' | 'inactive';
  role?: 'manager' | 'employee';
}

interface LinkData extends go.ObjectData {
  from: number;
  to: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('diagramDiv', { static: false }) diagramDiv!: ElementRef;

  protected readonly title = signal('GoJS Fundamentals Workshop');
  protected readonly currentExample = signal<string>('mental-model');

  private diagram!: go.Diagram;

  // Example data
  protected readonly nodeDataArray: NodeData[] = [
    { key: 1, name: 'Alice', status: 'active', role: 'manager' },
    { key: 2, name: 'Bob', status: 'active', role: 'employee' },
    { key: 3, name: 'Charlie', status: 'inactive', role: 'employee' }
  ];

  protected readonly linkDataArray: LinkData[] = [
    { from: 1, to: 2 },
    { from: 1, to: 3 }
  ];

  protected readonly examples: { id: string; name: string }[]  = [
    { id: 'mental-model', name: 'Mental Model: Diagram → Model → Parts' },
    { id: 'graphobject-basics', name: 'GraphObject Basics' },
    { id: 'bindings', name: 'Bindings (null-safe)' },
    { id: 'panels-auto', name: 'Panel: Auto' },
    { id: 'panels-spot', name: 'Panel: Spot' },
    { id: 'panels-vertical', name: 'Panel: Vertical/Horizontal' },
    { id: 'composition', name: 'Composition Pattern' },
    { id: 'events', name: 'Events & Interactions' }
  ];

  protected currentExampleName = computed(() =>
    this.examples.find(e => e.id === this.currentExample())?.name
  );

  ngAfterViewInit(): void {
    this.initDiagram();
    this.loadExample('mental-model');
  }

  private initDiagram(): void {
    // GoJS 3.1.4 - no more $ make function, use builder pattern
    this.diagram = new go.Diagram(this.diagramDiv.nativeElement, {
      'undoManager.isEnabled': true,
      layout: new go.TreeLayout({
        angle: 90,
        layerSpacing: 50
      })
    });

    // Default template (will be overridden by examples)
    this.diagram.nodeTemplate = this.createBasicNodeTemplate();

    // Link template - v3.1.4 builder pattern
    this.diagram.linkTemplate =
      new go.Link()
        .add(
          new go.Shape({ strokeWidth: 2, stroke: '#028090' }),
          new go.Shape({ toArrow: 'Standard', fill: '#028090', stroke: null })
        );
  }

  protected selectExample(exampleId: string): void {
    this.currentExample.set(exampleId);
    this.loadExample(exampleId);
  }

  private loadExample(exampleId: string): void {
    switch(exampleId) {
      case 'mental-model':
        this.diagram.nodeTemplate = this.createBasicNodeTemplate();
        this.updateModel();
        break;

      case 'graphobject-basics':
        // Show Shape, TextBlock, Panel - v3.1.4 builder pattern
        this.diagram.nodeTemplate =
          new go.Node('Auto')
            .add(
              new go.Shape('RoundedRectangle', {
                fill: 'lightblue',
                stroke: 'black',
                strokeWidth: 2
              }),
              new go.TextBlock({
                margin: 12,
                font: 'bold 14pt sans-serif'
              })
                .bind('text', 'name')
            );
        this.updateModel();
        break;

      case 'bindings':
        // Show data binding with status color - v3.1.4
        this.diagram.nodeTemplate =
          new go.Node('Auto')
            .add(
              new go.Shape('RoundedRectangle', {
                stroke: 'black',
                strokeWidth: 2
              })
                // Binding with conversion function
                .bind('fill', 'status', (status: string | undefined) =>
                  status === 'active' ? 'lightgreen' : 'lightcoral'
                ),
              new go.Panel('Vertical', { margin: 8 })
                .add(
                  new go.TextBlock({ font: 'bold 14pt sans-serif' })
                    .bind('text', 'name'),
                  new go.TextBlock({ font: '10pt sans-serif' })
                    .bind('text', 'status', (s: string | undefined) => s?.toUpperCase() || 'N/A')
                )
            );
        this.updateModel();
        break;

      case 'panels-auto':
        this.diagram.nodeTemplate =
          new go.Node('Auto')
            .add(
              new go.Shape('RoundedRectangle', {
                fill: 'white',
                stroke: '#028090',
                strokeWidth: 3
              }),
              new go.TextBlock({
                margin: 16,
                font: '14pt sans-serif'
              })
                .bind('text', 'name')
            );
        this.updateModel();
        break;

      case 'panels-spot':
        // Spot panel - absolute positioning - v3.1.4
        this.diagram.nodeTemplate =
          new go.Node('Spot')
            .add(
              new go.Shape('Circle', {
                width: 60,
                height: 60,
                fill: '#028090',
                stroke: null
              }),
              new go.TextBlock({
                stroke: 'white',
                font: 'bold 12pt sans-serif'
              })
                .bind('text', 'name'),
              // Badge in top-right corner
              new go.Shape('Circle', {
                alignment: go.Spot.TopRight,
                alignmentFocus: go.Spot.Center,
                width: 20,
                height: 20,
                fill: 'red',
                stroke: 'white',
                strokeWidth: 2
              }),
              new go.TextBlock('!', {
                alignment: go.Spot.TopRight,
                alignmentFocus: go.Spot.Center,
                stroke: 'white',
                font: 'bold 10pt sans-serif'
              })
            );
        this.updateModel();
        break;

      case 'panels-vertical':
        // Vertical/Horizontal panels - v3.1.4
        this.diagram.nodeTemplate =
          new go.Node('Auto')
            .add(
              new go.Shape('RoundedRectangle', {
                fill: 'white',
                stroke: '#028090',
                strokeWidth: 2
              }),
              new go.Panel('Vertical', { margin: 8 })
                .add(
                  new go.TextBlock({
                    font: 'bold 14pt sans-serif',
                    margin: new go.Margin(0, 0, 4, 0)
                  })
                    .bind('text', 'name'),
                  new go.Panel('Horizontal', { defaultAlignment: go.Spot.Left })
                    .add(
                      new go.Shape('Circle', {
                        width: 12,
                        height: 12,
                        margin: new go.Margin(0, 4, 0, 0)
                      })
                        .bind('fill', 'status', (s: string | undefined) =>
                          s === 'active' ? 'green' : 'gray'
                        ),
                      new go.TextBlock({ font: '10pt sans-serif' })
                        .bind('text', 'status')
                    ),
                  new go.TextBlock({
                    font: 'italic 10pt sans-serif',
                    stroke: 'gray'
                  })
                    .bind('text', 'role')
                )
            );
        this.updateModel();
        break;

      case 'composition':
        // Complex composition: Auto > Vertical > Horizontal - v3.1.4
        this.diagram.nodeTemplate =
          new go.Node('Auto')
            .add(
              new go.Shape('RoundedRectangle', {
                fill: 'white',
                stroke: null
              })
                .bind('fill', 'role', (role: string | undefined) =>
                  role === 'manager' ? '#FFF4E6' : 'white'
                ),
              new go.Panel('Vertical', { margin: 12 })
                .add(
                  // Header with role badge
                  new go.Panel('Horizontal', {
                    background: '#028090',
                    margin: new go.Margin(0, 0, 8, 0)
                  })
                    .add(
                      new go.TextBlock({
                        font: 'bold 14pt sans-serif',
                        stroke: 'white',
                        margin: 6
                      })
                        .bind('text', 'name'),
                      new go.Shape('Circle', {
                        width: 8,
                        height: 8,
                        fill: 'white',
                        margin: new go.Margin(0, 6, 0, 0)
                      })
                        .bind('visible', 'role', (r: string | undefined) => r === 'manager')
                    ),
                  // Status row
                  new go.Panel('Horizontal')
                    .add(
                      new go.Shape('RoundedRectangle', {
                        width: 60,
                        height: 20,
                        margin: new go.Margin(0, 4, 0, 0)
                      })
                        .bind('fill', 'status', (s: string | undefined) =>
                          s === 'active' ? '#D1FAE5' : '#FEE2E2'
                        ),
                      new go.TextBlock({
                        font: '10pt sans-serif',
                        margin: new go.Margin(0, 0, 0, -56)
                      })
                        .bind('text', 'status', (s: string | undefined) => s?.toUpperCase())
                    )
                )
            );
        this.updateModel();
        break;

      case 'events':
        // Interactive example with click handlers - v3.1.4
        this.diagram.nodeTemplate =
          new go.Node('Auto', {
            click: (e: go.InputEvent, obj: go.GraphObject) => {
              const node = obj.part as go.Node;
              const data = node.data as NodeData;
              console.log('Node clicked:', data);
              alert(`Clicked: ${data.name} (${data.status})`);
            },
            mouseEnter: (e: go.InputEvent, obj: go.GraphObject) => {
              const shape = obj.part?.findObject('SHAPE') as go.Shape;
              if (shape) shape.stroke = '#02C39A';
            },
            mouseLeave: (e: go.InputEvent, obj: go.GraphObject) => {
              const shape = obj.part?.findObject('SHAPE') as go.Shape;
              if (shape) shape.stroke = 'black';
            }
          })
            .add(
              new go.Shape('RoundedRectangle', {
                name: 'SHAPE',
                fill: 'lightblue',
                stroke: 'black',
                strokeWidth: 2,
                cursor: 'pointer'
              }),
              new go.TextBlock({
                margin: 12,
                font: '14pt sans-serif'
              })
                .bind('text', 'name')
            );
        this.updateModel();
        break;
    }
  }

  private createBasicNodeTemplate(): go.Node {
    // v3.1.4 builder pattern
    return new go.Node('Auto')
      .add(
        new go.Shape('RoundedRectangle', {
          fill: 'white',
          stroke: '#028090',
          strokeWidth: 2
        }),
        new go.TextBlock({
          margin: 10,
          font: '14pt sans-serif'
        })
          .bind('text', 'name')
      );
  }

  private updateModel(): void {
    this.diagram.model = new go.GraphLinksModel(
      this.nodeDataArray,
      this.linkDataArray
    );
  }

  // Interactive methods for demonstration
  protected addNode(): void {
    const newKey = Math.max(...this.nodeDataArray.map(n => n.key)) + 1;
    this.diagram.model.addNodeData({
      key: newKey,
      name: `Person ${newKey}`,
      status: 'active',
      role: 'employee'
    });
  }

  protected removeSelectedNode(): void {
    const selectedNode = this.diagram.selection.first();
    if (selectedNode instanceof go.Node) {
      this.diagram.model.removeNodeData(selectedNode.data);
    }
  }

  protected toggleStatus(): void {
    const selectedNode = this.diagram.selection.first();
    if (selectedNode instanceof go.Node) {
      const data = selectedNode.data as NodeData;
      this.diagram.model.setDataProperty(
        data,
        'status',
        data.status === 'active' ? 'inactive' : 'active'
      );
    }
  }

  protected logModelData(): void {
    console.log('Current Model:', {
      nodeDataArray: this.diagram.model.nodeDataArray,
      linkDataArray: (this.diagram.model as go.GraphLinksModel).linkDataArray
    });
  }

  protected logSelectedPart(): void {
    const selected = this.diagram.selection.first();
    if (selected) {
      console.log('Selected Part:', {
        type: selected instanceof go.Node ? 'Node' : 'Link',
        data: selected.data
      });
    }
  }
}
