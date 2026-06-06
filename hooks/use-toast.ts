export function useToast() {
  return {
    toast: (_data?:any) => {},
    dismiss: () => {},
    toasts: [],
  };
}
