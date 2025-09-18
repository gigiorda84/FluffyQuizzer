import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Card {
  id: string;
  categoria: string;
  colore: string;
  domanda: string;
  opzioneA?: string;
  opzioneB?: string;
  opzioneC?: string;
  corretta?: 'A' | 'B' | 'C';
  battuta?: string;
  tipo: 'quiz' | 'speciale';
  createdAt: string;
}

const cardFormSchema = z.object({
  id: z.string().min(1, "ID è richiesto"),
  categoria: z.string().min(1, "Categoria è richiesta"),
  colore: z.string().min(1, "Colore è richiesto"),
  domanda: z.string().min(1, "Domanda è richiesta"),
  opzioneA: z.string().optional(),
  opzioneB: z.string().optional(),
  opzioneC: z.string().optional(),
  corretta: z.enum(['A', 'B', 'C']).optional(),
  battuta: z.string().optional(),
  tipo: z.enum(['quiz', 'speciale'])
});

type CardFormData = z.infer<typeof cardFormSchema>;

interface CardFormProps {
  card?: Card | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
}

export default function CardForm({ card, isOpen, onClose, mode }: CardFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      id: "",
      categoria: "",
      colore: "verde",
      domanda: "",
      opzioneA: "",
      opzioneB: "",
      opzioneC: "",
      corretta: undefined,
      battuta: "",
      tipo: "quiz"
    }
  });

  const [isQuizCard, setIsQuizCard] = useState(true);

  // Reset form when card changes
  useEffect(() => {
    if (card) {
      form.reset({
        id: card.id,
        categoria: card.categoria,
        colore: card.colore,
        domanda: card.domanda,
        opzioneA: card.opzioneA || "",
        opzioneB: card.opzioneB || "",
        opzioneC: card.opzioneC || "",
        corretta: card.corretta,
        battuta: card.battuta || "",
        tipo: card.tipo
      });
      setIsQuizCard(card.tipo === 'quiz');
    } else {
      form.reset({
        id: "",
        categoria: "",
        colore: "verde",
        domanda: "",
        opzioneA: "",
        opzioneB: "",
        opzioneC: "",
        corretta: undefined,
        battuta: "",
        tipo: "quiz"
      });
      setIsQuizCard(true);
    }
  }, [card, form]);

  const createMutation = useMutation({
    mutationFn: async (data: CardFormData) => {
      return apiRequest('POST', '/api/cards', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: "Carta creata",
        description: "La carta è stata creata con successo",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: "Errore nella creazione della carta: " + error.message,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CardFormData) => {
      return apiRequest('PUT', `/api/cards/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({
        title: "Carta aggiornata",
        description: "La carta è stata aggiornata con successo",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento della carta: " + error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CardFormData) => {
    // Clean up data based on card type
    if (data.tipo === 'speciale') {
      data.opzioneA = undefined;
      data.opzioneB = undefined;
      data.opzioneC = undefined;
      data.corretta = undefined;
    }

    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const watchTipo = form.watch("tipo");
  
  useEffect(() => {
    setIsQuizCard(watchTipo === 'quiz');
  }, [watchTipo]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crea nuova carta' : 'Modifica carta'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Compila i campi per creare una nuova carta' 
              : 'Modifica i campi della carta'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Carta</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="es. V001" 
                        disabled={mode === 'edit'}
                        data-testid="input-card-id"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Carta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-card-type">
                          <SelectValue placeholder="Seleziona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz (domande)</SelectItem>
                        <SelectItem value="speciale">Speciale (istruzioni)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-card-category">
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CIBI FURBI & CIBI TRAPPOLA">CIBI FURBI & CIBI TRAPPOLA</SelectItem>
                        <SelectItem value="IL PIANETA NEL PIATTO">IL PIANETA NEL PIATTO</SelectItem>
                        <SelectItem value="CULTURA DEL CIBO">CULTURA DEL CIBO</SelectItem>
                        <SelectItem value="ANATOMIA A TAVOLA">ANATOMIA A TAVOLA</SelectItem>
                        <SelectItem value="ERBE SPONTANEE">ERBE SPONTANEE</SelectItem>
                        <SelectItem value="FRUTTA">FRUTTA</SelectItem>
                        <SelectItem value="ORTAGGI & VERDURE">ORTAGGI & VERDURE</SelectItem>
                        <SelectItem value="SPECIALE">SPECIALE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colore</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-card-color">
                          <SelectValue placeholder="Seleziona colore" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="verde">Verde</SelectItem>
                        <SelectItem value="blu">Blu</SelectItem>
                        <SelectItem value="arancione">Arancione</SelectItem>
                        <SelectItem value="viola">Viola</SelectItem>
                        <SelectItem value="speciale">Speciale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="domanda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domanda/Istruzione</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={isQuizCard ? "Inserisci la domanda..." : "Inserisci le istruzioni speciali..."}
                      className="min-h-[100px]"
                      data-testid="textarea-question"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isQuizCard && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Opzioni di risposta</h4>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="opzioneA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opzione A</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Prima opzione..." data-testid="input-option-a" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="opzioneB"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opzione B</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Seconda opzione..." data-testid="input-option-b" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="opzioneC"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opzione C</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Terza opzione..." data-testid="input-option-c" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="corretta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risposta corretta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-correct-answer">
                              <SelectValue placeholder="Seleziona risposta corretta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="battuta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Battuta/Spiegazione</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Inserisci la battuta o spiegazione..."
                          className="min-h-[80px]"
                          data-testid="textarea-punchline"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-card"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salva'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}